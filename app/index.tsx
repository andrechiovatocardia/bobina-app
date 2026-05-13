import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  StatusBar, Modal, KeyboardAvoidingView, Platform, Dimensions,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type HistoricoItem = {
  id: string;
  data: string;
  valores: Record<string, string>;
  resultado: Resultado;
};

type Resultado = {
  voltasPorCamada: number;
  numeroCamadas: number;
  totalVoltas: number;
  diametroMedio: number;
  comprimentoTotal: number;
  comprimentoComFator: number;
};

export default function Index() {
  const [di, setDi] = useState("");
  const [de, setDe] = useState("");
  const [larg, setLarg] = useState("");
  const [folga, setFolga] = useState("");
  const [cabo, setCabo] = useState("");
  const [fator, setFator] = useState("90");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState("");
  const [modalSalvar, setModalSalvar] = useState(false);
  const [nomeBobina, setNomeBobina] = useState("");
  const router = useRouter();

  const valores = { diametroInterno: di, diametroExterno: de, largura: larg, folga, diametroCabo: cabo, fatorEnchimento: fator };

  const salvarHistorico = async (res: Resultado) => {
    try {
      const raw = await AsyncStorage.getItem("historico");
      const historico: HistoricoItem[] = raw ? JSON.parse(raw) : [];
      const novoItem: HistoricoItem = {
        id: Date.now().toString(),
        data: new Date().toLocaleString("pt-BR"),
        valores,
        resultado: res,
      };
      await AsyncStorage.setItem("historico", JSON.stringify([novoItem, ...historico].slice(0, 15)));
    } catch (e) { console.error(e); }
  };

  const calcular = async () => {
    setErro("");
    const vDi = parseFloat(di), vDe = parseFloat(de), vLarg = parseFloat(larg);
    const vFolga = parseFloat(folga), vCabo = parseFloat(cabo), vFator = parseFloat(fator) / 100;

    if ([vDi, vDe, vLarg, vFolga, vCabo, vFator].some(isNaN)) { setErro("Preencha todos os campos."); return; }
    if (vCabo <= 0) { setErro("Diâmetro do cabo inválido."); return; }
    if (vDe <= vDi) { setErro("Ø Externo deve ser maior que Ø Interno."); return; }
    if (vFator <= 0 || vFator > 1) { setErro("Fator deve ser entre 1 e 100."); return; }

    const diametroUtil = vDe - vFolga * 2;
    const voltasPorCamada = Math.floor(vLarg / vCabo);
    const alturaEnrolamento = (diametroUtil - vDi) / 2;
    const numeroCamadas = Math.floor(alturaEnrolamento / vCabo);
    const totalVoltas = voltasPorCamada * numeroCamadas;
    const diametroMedio = (vDi + diametroUtil) / 2;
    const comprimentoTotal = totalVoltas * Math.PI * diametroMedio;
    const comprimentoComFator = comprimentoTotal * vFator;

    const res: Resultado = {
      voltasPorCamada, numeroCamadas, totalVoltas, diametroMedio,
      comprimentoTotal: comprimentoTotal / 1000,
      comprimentoComFator: comprimentoComFator / 1000,
    };
    setResultado(res);
    await salvarHistorico(res);
  };

  const limpar = () => {
    setDi(""); setDe(""); setLarg(""); setFolga(""); setCabo(""); setFator("90");
    setResultado(null); setErro("");
  };

  const salvarBobina = async () => {
    if (!nomeBobina.trim()) return;
    try {
      const raw = await AsyncStorage.getItem("minhasbobinas");
      const lista = raw ? JSON.parse(raw) : [];
      const nova = { id: Date.now().toString(), nome: nomeBobina.trim(), valores };
      await AsyncStorage.setItem("minhasbobinas", JSON.stringify([nova, ...lista]));
      setModalSalvar(false);
      setNomeBobina("");
    } catch (e) { console.error(e); }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      {/* HEADER */}
      <View style={s.header}>
        <View>
          <Text style={s.eyebrow}>CÁLCULO DE</Text>
          <Text style={s.title}>Bobinas</Text>
        </View>
        <View style={s.navBtns}>
          <TouchableOpacity style={s.navBtn} onPress={() => router.push("/historico")}>
            <Text style={s.navBtnText}>📋</Text>
            <Text style={s.navBtnLabel}>Histórico</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navBtn} onPress={() => router.push("/minhasbobinas")}>
            <Text style={s.navBtnText}>⭐</Text>
            <Text style={s.navBtnLabel}>Minhas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CAMPOS EM 2 COLUNAS */}
      <View style={s.card}>
        <Text style={s.cardTitle}>DADOS DO CARRETEL</Text>

        <View style={s.row}>
          <View style={s.col}>
            <Text style={s.label}>Ø Interno</Text>
            <View style={s.inputRow}>
              <TextInput style={s.input} value={di} onChangeText={setDi} keyboardType="decimal-pad" placeholder="ex: 200" placeholderTextColor="#5A7A9A" />
              <Text style={s.unit}>mm</Text>
            </View>
          </View>
          <View style={s.col}>
            <Text style={s.label}>Ø Externo</Text>
            <View style={s.inputRow}>
              <TextInput style={s.input} value={de} onChangeText={setDe} keyboardType="decimal-pad" placeholder="ex: 400" placeholderTextColor="#5A7A9A" />
              <Text style={s.unit}>mm</Text>
            </View>
          </View>
        </View>

        <View style={s.row}>
          <View style={s.col}>
            <Text style={s.label}>Largura Útil</Text>
            <View style={s.inputRow}>
              <TextInput style={s.input} value={larg} onChangeText={setLarg} keyboardType="decimal-pad" placeholder="ex: 250" placeholderTextColor="#5A7A9A" />
              <Text style={s.unit}>mm</Text>
            </View>
          </View>
          <View style={s.col}>
            <Text style={s.label}>Folga</Text>
            <View style={s.inputRow}>
              <TextInput style={s.input} value={folga} onChangeText={setFolga} keyboardType="decimal-pad" placeholder="ex: 5" placeholderTextColor="#5A7A9A" />
              <Text style={s.unit}>mm</Text>
            </View>
          </View>
        </View>

        <View style={s.row}>
          <View style={s.col}>
            <Text style={s.label}>Ø do Cabo</Text>
            <View style={s.inputRow}>
              <TextInput style={s.input} value={cabo} onChangeText={setCabo} keyboardType="decimal-pad" placeholder="ex: 0.9" placeholderTextColor="#5A7A9A" />
              <Text style={s.unit}>mm</Text>
            </View>
          </View>
          <View style={s.col}>
            <Text style={s.label}>Fator Enchimento</Text>
            <View style={s.inputRow}>
              <TextInput style={s.input} value={fator} onChangeText={setFator} keyboardType="decimal-pad" placeholder="90" placeholderTextColor="#5A7A9A" />
              <Text style={s.unit}>%</Text>
            </View>
          </View>
        </View>

        {erro ? <Text style={s.erro}>⚠ {erro}</Text> : null}

        {/* BOTÕES DE AÇÃO */}
        <View style={s.actionRow}>
          <TouchableOpacity style={s.btnCalcular} onPress={calcular} activeOpacity={0.85}>
            <Text style={s.btnCalcularText}>CALCULAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnIcone} onPress={limpar} activeOpacity={0.7}>
            <Text style={s.btnIconeText}>🗑</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnIcone} onPress={() => setModalSalvar(true)} activeOpacity={0.7}>
            <Text style={s.btnIconeText}>⭐</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RESULTADO */}
      <View style={s.resultadoCard}>
        {resultado ? (
          <>
            <View style={s.resultadoTopo}>
              <View style={s.resultadoPrincipal}>
                <Text style={s.resultadoValor}>
                  {Math.round(resultado.comprimentoComFator).toLocaleString("pt-BR")}
                </Text>
                <Text style={s.resultadoUnidade}>metros</Text>
                <Text style={s.resultadoKm}>≈ {(resultado.comprimentoComFator / 1000).toFixed(2)} km</Text>
              </View>
              <View style={s.resultadoDetalhes}>
                {[
                  ["Voltas/camada", `${resultado.voltasPorCamada}`],
                  ["Camadas", `${resultado.numeroCamadas}`],
                  ["Total voltas", `${resultado.totalVoltas.toLocaleString("pt-BR")}`],
                  ["Ø médio", `${resultado.diametroMedio.toFixed(0)} mm`],
                ].map(([l, v]) => (
                  <View key={l} style={s.detalheItem}>
                    <Text style={s.detalheLabel}>{l}</Text>
                    <Text style={s.detalheValor}>{v}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={s.resultadoBruto}>Bruto: {resultado.comprimentoTotal.toFixed(0)} m</Text>
          </>
        ) : (
          <View style={s.resultadoVazio}>
            <Text style={s.resultadoVazioText}>Preencha os campos e calcule</Text>
          </View>
        )}
      </View>

      {/* MODAL SALVAR BOBINA */}
      <Modal visible={modalSalvar} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={s.modalCard}>
              <Text style={s.modalTitulo}>Salvar Bobina</Text>
              <Text style={s.modalSub}>Digite um nome para identificar esta bobina</Text>
              <TextInput
                style={s.modalInput}
                value={nomeBobina}
                onChangeText={setNomeBobina}
                placeholder="ex: Bobina Linha 3"
                placeholderTextColor="#5A7A9A"
                autoFocus
              />
              <View style={s.modalBtns}>
                <TouchableOpacity style={s.modalBtnCancelar} onPress={() => { setModalSalvar(false); setNomeBobina(""); }}>
                  <Text style={s.modalBtnCancelarText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.modalBtnSalvar} onPress={salvarBobina}>
                  <Text style={s.modalBtnSalvarText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Text style={s.footer}>BobinaApp © 2025</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D1B2A", paddingHorizontal: 14, paddingTop: 48 },

  // HEADER
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  eyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 4, color: "#3B9EFF" },
  title: { fontSize: 32, fontWeight: "800", color: "#FFFFFF", letterSpacing: -1 },
  navBtns: { flexDirection: "row", gap: 8 },
  navBtn: { backgroundColor: "#112236", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center", borderWidth: 1, borderColor: "#1E3A5F" },
  navBtnText: { fontSize: 18 },
  navBtnLabel: { fontSize: 10, color: "#3B9EFF", fontWeight: "600", marginTop: 2 },

  // CARD CAMPOS
  card: { backgroundColor: "#112236", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#1E3A5F", marginBottom: 12 },
  cardTitle: { fontSize: 11, fontWeight: "700", color: "#3B9EFF", letterSpacing: 2, marginBottom: 12 },
  row: { flexDirection: "row", gap: 10, marginBottom: 10 },
  col: { flex: 1 },
  label: { fontSize: 11, color: "#8AAFCC", fontWeight: "600", marginBottom: 5, letterSpacing: 0.3 },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#0D1B2A", borderRadius: 10, borderWidth: 1, borderColor: "#1E3A5F", paddingRight: 8 },
  input: { flex: 1, paddingHorizontal: 10, paddingVertical: 10, fontSize: 15, color: "#FFFFFF", fontWeight: "500" },
  unit: { fontSize: 11, color: "#3B9EFF", fontWeight: "700" },
  erro: { color: "#FF6B6B", fontSize: 12, marginBottom: 8, textAlign: "center" },

  // BOTÕES AÇÃO
  actionRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  btnCalcular: { flex: 1, backgroundColor: "#3B9EFF", borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  btnCalcularText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", letterSpacing: 2 },
  btnIcone: { backgroundColor: "#1E3A5F", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#2A4A6A" },
  btnIconeText: { fontSize: 18 },

  // RESULTADO
  resultadoCard: { backgroundColor: "#112236", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#3B9EFF", flex: 1 },
  resultadoTopo: { flexDirection: "row", gap: 12, alignItems: "center" },
  resultadoPrincipal: { flex: 1, alignItems: "center" },
  resultadoValor: { fontSize: 44, fontWeight: "800", color: "#FFFFFF", letterSpacing: -2, lineHeight: 48 },
  resultadoUnidade: { fontSize: 16, color: "#3B9EFF", fontWeight: "600" },
  resultadoKm: { fontSize: 13, color: "#8AAFCC", marginTop: 4 },
  resultadoDetalhes: { flex: 1, gap: 6 },
  detalheItem: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#1A3050", paddingBottom: 4 },
  detalheLabel: { color: "#5A7A9A", fontSize: 11 },
  detalheValor: { color: "#FFFFFF", fontSize: 11, fontWeight: "600" },
  resultadoBruto: { color: "#2A4A6A", fontSize: 11, textAlign: "center", marginTop: 8 },
  resultadoVazio: { flex: 1, alignItems: "center", justifyContent: "center" },
  resultadoVazioText: { color: "#2A4A6A", fontSize: 13 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalCard: { backgroundColor: "#112236", borderRadius: 20, padding: 24, width: 300, borderWidth: 1, borderColor: "#3B9EFF" },
  modalTitulo: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", marginBottom: 6 },
  modalSub: { fontSize: 13, color: "#5A7A9A", marginBottom: 16 },
  modalInput: { backgroundColor: "#0D1B2A", borderRadius: 10, borderWidth: 1, borderColor: "#1E3A5F", paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#FFFFFF", marginBottom: 16 },
  modalBtns: { flexDirection: "row", gap: 10 },
  modalBtnCancelar: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 10, borderWidth: 1, borderColor: "#1E3A5F" },
  modalBtnCancelarText: { color: "#5A7A9A", fontSize: 14, fontWeight: "600" },
  modalBtnSalvar: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 10, backgroundColor: "#3B9EFF" },
  modalBtnSalvarText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },

  footer: { color: "#1A2A3A", fontSize: 11, textAlign: "center", paddingVertical: 8 },
});
