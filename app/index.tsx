import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Campo = {
  label: string;
  key: string;
  unidade: string;
  placeholder: string;
};

const campos: Campo[] = [
  { label: "Diâmetro Interno do Carretel", key: "diametroInterno", unidade: "mm", placeholder: "ex: 200" },
  { label: "Diâmetro Externo da Flange", key: "diametroExterno", unidade: "mm", placeholder: "ex: 400" },
  { label: "Largura Útil da Bobina", key: "largura", unidade: "mm", placeholder: "ex: 250" },
  { label: "Folga (cada lado)", key: "folga", unidade: "mm", placeholder: "ex: 5" },
  { label: "Diâmetro do Cabo", key: "diametroCabo", unidade: "mm", placeholder: "ex: 0.9" },
  { label: "Fator de Enchimento", key: "fatorEnchimento", unidade: "%", placeholder: "ex: 90" },
];

type Resultado = {
  voltasPorCamada: number;
  numeroCamadas: number;
  totalVoltas: number;
  diametroMedio: number;
  comprimentoTotal: number;
  comprimentoComFator: number;
};

export type HistoricoItem = {
  id: string;
  data: string;
  valores: Record<string, string>;
  resultado: Resultado;
};

export default function Index() {
  const [valores, setValores] = useState<Record<string, string>>({ fatorEnchimento: "90" });
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState<string>("");
  const router = useRouter();

  const handleChange = (key: string, value: string) => {
    setValores((prev) => ({ ...prev, [key]: value }));
    setErro("");
    setResultado(null);
  };

  const salvarHistorico = async (vals: Record<string, string>, res: Resultado) => {
    try {
      const raw = await AsyncStorage.getItem("historico");
      const historico: HistoricoItem[] = raw ? JSON.parse(raw) : [];
      const novoItem: HistoricoItem = {
        id: Date.now().toString(),
        data: new Date().toLocaleString("pt-BR"),
        valores: vals,
        resultado: res,
      };
      const atualizado = [novoItem, ...historico].slice(0, 15);
      await AsyncStorage.setItem("historico", JSON.stringify(atualizado));
    } catch (e) {
      console.error("Erro ao salvar histórico:", e);
    }
  };

  const calcular = async () => {
    const di = parseFloat(valores.diametroInterno);
    const de = parseFloat(valores.diametroExterno);
    const larg = parseFloat(valores.largura);
    const folga = parseFloat(valores.folga);
    const dc = parseFloat(valores.diametroCabo);
    const fator = parseFloat(valores.fatorEnchimento) / 100;

    if ([di, de, larg, folga, dc, fator].some(isNaN)) {
      setErro("Preencha todos os campos com valores válidos.");
      return;
    }
    if (dc <= 0) { setErro("Diâmetro do cabo deve ser maior que zero."); return; }
    if (de <= di) { setErro("Diâmetro externo deve ser maior que o interno."); return; }
    if (fator <= 0 || fator > 1) { setErro("Fator de enchimento deve ser entre 1 e 100."); return; }

    const diametroUtil = de - folga * 2;
    const voltasPorCamada = Math.floor(larg / dc);
    const alturaEnrolamento = (diametroUtil - di) / 2;
    const numeroCamadas = Math.floor(alturaEnrolamento / dc);
    const totalVoltas = voltasPorCamada * numeroCamadas;
    const diametroMedio = (di + diametroUtil) / 2;
    const comprimentoTotal = totalVoltas * Math.PI * diametroMedio;
    const comprimentoComFator = comprimentoTotal * fator;

    const res: Resultado = {
      voltasPorCamada,
      numeroCamadas,
      totalVoltas,
      diametroMedio,
      comprimentoTotal: comprimentoTotal / 1000,
      comprimentoComFator: comprimentoComFator / 1000,
    };

    setResultado(res);
    await salvarHistorico(valores, res);
  };

  const limpar = () => {
    setValores({ fatorEnchimento: "90" });
    setResultado(null);
    setErro("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>CÁLCULO DE</Text>
          <Text style={styles.headerTitle}>Bobinas</Text>
          <Text style={styles.headerSub}>Comprimento de cabo por carretel</Text>
          <TouchableOpacity style={styles.btnHistorico} onPress={() => router.push("/historico")} activeOpacity={0.8}>
            <Text style={styles.btnHistoricoText}>📋 Histórico</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dados do Carretel</Text>
          {campos.map((campo) => (
            <View key={campo.key} style={styles.inputGroup}>
              <Text style={styles.label}>{campo.label}</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder={campo.placeholder}
                  placeholderTextColor="#5A7A9A"
                  keyboardType="decimal-pad"
                  value={valores[campo.key] ?? ""}
                  onChangeText={(v) => handleChange(campo.key, v)}
                />
                <View style={styles.unidadeBadge}>
                  <Text style={styles.unidadeText}>{campo.unidade}</Text>
                </View>
              </View>
            </View>
          ))}

          {erro ? (
            <View style={styles.erroBox}>
              <Text style={styles.erroText}>⚠ {erro}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.btnCalcular} onPress={calcular} activeOpacity={0.85}>
            <Text style={styles.btnCalcularText}>CALCULAR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLimpar} onPress={limpar} activeOpacity={0.7}>
            <Text style={styles.btnLimparText}>Limpar campos</Text>
          </TouchableOpacity>
        </View>

        {resultado && (
          <View style={styles.resultadoCard}>
            <Text style={styles.resultadoTitulo}>Resultado</Text>
            <View style={styles.resultadoPrincipal}>
              <Text style={styles.resultadoValorGrande}>
                {Math.round(resultado.comprimentoComFator).toLocaleString("pt-BR")}
              </Text>
              <Text style={styles.resultadoUnidadeGrande}>metros</Text>
              <Text style={styles.resultadoKm}>
                ≈ {(resultado.comprimentoComFator / 1000).toFixed(2)} km
              </Text>
              <Text style={styles.resultadoFatorLabel}>com fator de enchimento</Text>
            </View>
            <View style={styles.divisor} />
            <Text style={styles.detalhesTitulo}>Detalhes do cálculo</Text>
            {[
              ["Voltas por camada", `${resultado.voltasPorCamada}`],
              ["Número de camadas", `${resultado.numeroCamadas}`],
              ["Total de voltas", `${resultado.totalVoltas.toLocaleString("pt-BR")}`],
              ["Diâmetro médio", `${resultado.diametroMedio.toFixed(1)} mm`],
              ["Comprimento bruto", `${resultado.comprimentoTotal.toFixed(0)} m`],
            ].map(([label, valor]) => (
              <View key={label} style={styles.detalheRow}>
                <Text style={styles.detalheLabel}>{label}</Text>
                <Text style={styles.detalheValor}>{valor}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>BobinaApp © 2025</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D1B2A" },
  scroll: { paddingBottom: 40 },
  header: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 24, backgroundColor: "#0D1B2A" },
  headerEyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 4, color: "#3B9EFF", marginBottom: 4 },
  headerTitle: { fontSize: 42, fontWeight: "800", color: "#FFFFFF", letterSpacing: -1, lineHeight: 44 },
  headerSub: { fontSize: 14, color: "#5A7A9A", marginTop: 6, fontWeight: "400" },
  btnHistorico: {
    marginTop: 16, alignSelf: "flex-start", backgroundColor: "#1E3A5F",
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: "#3B9EFF",
  },
  btnHistoricoText: { color: "#3B9EFF", fontSize: 13, fontWeight: "600" },
  card: { marginHorizontal: 16, backgroundColor: "#112236", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#1E3A5F" },
  cardTitle: { fontSize: 13, fontWeight: "700", color: "#3B9EFF", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, color: "#8AAFCC", fontWeight: "600", marginBottom: 6, letterSpacing: 0.5 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    flex: 1, backgroundColor: "#0D1B2A", borderWidth: 1, borderColor: "#1E3A5F",
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, color: "#FFFFFF", fontWeight: "500",
  },
  unidadeBadge: { backgroundColor: "#1E3A5F", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 12, minWidth: 44, alignItems: "center" },
  unidadeText: { color: "#3B9EFF", fontSize: 12, fontWeight: "700" },
  erroBox: { backgroundColor: "#2A1010", borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "#7A2020" },
  erroText: { color: "#FF6B6B", fontSize: 13, fontWeight: "500" },
  btnCalcular: { backgroundColor: "#3B9EFF", borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  btnCalcularText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", letterSpacing: 2 },
  btnLimpar: { paddingVertical: 12, alignItems: "center", marginTop: 4 },
  btnLimparText: { color: "#5A7A9A", fontSize: 13, fontWeight: "500" },
  resultadoCard: { marginHorizontal: 16, marginTop: 16, backgroundColor: "#112236", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "#3B9EFF" },
  resultadoTitulo: { fontSize: 11, fontWeight: "700", color: "#3B9EFF", letterSpacing: 3, textTransform: "uppercase", marginBottom: 20 },
  resultadoPrincipal: { alignItems: "center", paddingVertical: 8 },
  resultadoValorGrande: { fontSize: 64, fontWeight: "800", color: "#FFFFFF", letterSpacing: -2, lineHeight: 68 },
  resultadoUnidadeGrande: { fontSize: 20, color: "#3B9EFF", fontWeight: "600", marginTop: 4 },
  resultadoKm: { fontSize: 16, color: "#8AAFCC", marginTop: 6, fontWeight: "500" },
  resultadoFatorLabel: { fontSize: 11, color: "#5A7A9A", marginTop: 4, letterSpacing: 0.5 },
  divisor: { height: 1, backgroundColor: "#1E3A5F", marginVertical: 20 },
  detalhesTitulo: { fontSize: 11, fontWeight: "700", color: "#5A7A9A", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 },
  detalheRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#1A3050" },
  detalheLabel: { color: "#8AAFCC", fontSize: 13, fontWeight: "400" },
  detalheValor: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  footer: { marginTop: 32, alignItems: "center" },
  footerText: { color: "#2A4A6A", fontSize: 12 },
});
