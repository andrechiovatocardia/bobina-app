import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import type { HistoricoItem } from "./index";

export default function Historico() {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      const raw = await AsyncStorage.getItem("historico");
      if (raw) setHistorico(JSON.parse(raw));
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
    }
  };

  const limparHistorico = () => {
    Alert.alert(
      "Limpar histórico",
      "Deseja apagar todos os cálculos salvos?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar tudo",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("historico");
            setHistorico([]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
            <Text style={styles.btnVoltarText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerEyebrow}>ÚLTIMOS 15</Text>
          <Text style={styles.headerTitle}>Histórico</Text>
          <Text style={styles.headerSub}>{historico.length} cálculo{historico.length !== 1 ? "s" : ""} salvo{historico.length !== 1 ? "s" : ""}</Text>
        </View>

        {/* LISTA VAZIA */}
        {historico.length === 0 && (
          <View style={styles.vazioBox}>
            <Text style={styles.vazioEmoji}>📋</Text>
            <Text style={styles.vazioTitulo}>Nenhum cálculo ainda</Text>
            <Text style={styles.vazioSub}>Faça um cálculo na tela principal para ele aparecer aqui.</Text>
          </View>
        )}

        {/* ITENS */}
        {historico.map((item, index) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.itemNumero}>
                <Text style={styles.itemNumeroText}>{index + 1}</Text>
              </View>
              <Text style={styles.itemData}>{item.data}</Text>
            </View>

            <View style={styles.itemDestaque}>
              <Text style={styles.itemValorGrande}>
                {Math.round(item.resultado.comprimentoComFator).toLocaleString("pt-BR")}
              </Text>
              <Text style={styles.itemUnidade}> metros</Text>
            </View>
            <Text style={styles.itemKm}>
              ≈ {(item.resultado.comprimentoComFator / 1000).toFixed(2)} km
            </Text>

            <View style={styles.itemDivisor} />

            <View style={styles.itemDetalhes}>
              {[
                ["Ø Interno", `${item.valores.diametroInterno} mm`],
                ["Ø Externo", `${item.valores.diametroExterno} mm`],
                ["Largura", `${item.valores.largura} mm`],
                ["Cabo", `${item.valores.diametroCabo} mm`],
              ].map(([label, valor]) => (
                <View key={label} style={styles.itemDetalheCol}>
                  <Text style={styles.itemDetalheLabel}>{label}</Text>
                  <Text style={styles.itemDetalheValor}>{valor}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* BOTÃO LIMPAR */}
        {historico.length > 0 && (
          <TouchableOpacity style={styles.btnLimpar} onPress={limparHistorico} activeOpacity={0.7}>
            <Text style={styles.btnLimparText}>🗑 Limpar histórico</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>BobinaApp © 2025</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D1B2A" },
  scroll: { paddingBottom: 40 },

  header: { paddingTop: 60, paddingBottom: 28, paddingHorizontal: 24, backgroundColor: "#0D1B2A" },
  btnVoltar: { marginBottom: 16 },
  btnVoltarText: { color: "#3B9EFF", fontSize: 14, fontWeight: "600" },
  headerEyebrow: { fontSize: 11, fontWeight: "700", letterSpacing: 4, color: "#3B9EFF", marginBottom: 4 },
  headerTitle: { fontSize: 42, fontWeight: "800", color: "#FFFFFF", letterSpacing: -1, lineHeight: 44 },
  headerSub: { fontSize: 14, color: "#5A7A9A", marginTop: 6 },

  vazioBox: { alignItems: "center", marginTop: 60, paddingHorizontal: 40 },
  vazioEmoji: { fontSize: 48, marginBottom: 16 },
  vazioTitulo: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", marginBottom: 8 },
  vazioSub: { fontSize: 14, color: "#5A7A9A", textAlign: "center", lineHeight: 20 },

  itemCard: {
    marginHorizontal: 16, marginBottom: 12, backgroundColor: "#112236",
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#1E3A5F",
  },
  itemHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  itemNumero: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: "#1E3A5F",
    alignItems: "center", justifyContent: "center", marginRight: 10,
  },
  itemNumeroText: { color: "#3B9EFF", fontSize: 11, fontWeight: "700" },
  itemData: { color: "#5A7A9A", fontSize: 12 },
  itemDestaque: { flexDirection: "row", alignItems: "baseline" },
  itemValorGrande: { fontSize: 36, fontWeight: "800", color: "#FFFFFF", letterSpacing: -1 },
  itemUnidade: { fontSize: 16, color: "#3B9EFF", fontWeight: "600" },
  itemKm: { color: "#8AAFCC", fontSize: 13, marginTop: 2, marginBottom: 12 },
  itemDivisor: { height: 1, backgroundColor: "#1E3A5F", marginBottom: 12 },
  itemDetalhes: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  itemDetalheCol: {
    backgroundColor: "#0D1B2A", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, minWidth: "45%",
  },
  itemDetalheLabel: { color: "#5A7A9A", fontSize: 10, fontWeight: "600", marginBottom: 2 },
  itemDetalheValor: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },

  btnLimpar: { marginHorizontal: 16, marginTop: 8, paddingVertical: 14, alignItems: "center" },
  btnLimparText: { color: "#FF6B6B", fontSize: 13, fontWeight: "600" },

  footer: { marginTop: 24, alignItems: "center" },
  footerText: { color: "#2A4A6A", fontSize: 12 },
});
