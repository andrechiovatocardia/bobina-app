import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView, StatusBar,
  StyleSheet, Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { HistoricoItem } from "./index";

export default function Historico() {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const router = useRouter();

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const raw = await AsyncStorage.getItem("historico");
      if (raw) setHistorico(JSON.parse(raw));
    } catch (e) { console.error(e); }
  };

  const limparHistorico = () => {
    Alert.alert("Limpar histórico", "Deseja apagar todos os cálculos salvos?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Apagar tudo", style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("historico");
          setHistorico([]);
        }
      }
    ]);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.btnVoltar}>
            <Text style={s.btnVoltarText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={s.eyebrow}>ÚLTIMOS 15</Text>
          <Text style={s.title}>Histórico</Text>
          <Text style={s.sub}>{historico.length} cálculo{historico.length !== 1 ? "s" : ""} salvo{historico.length !== 1 ? "s" : ""}</Text>
        </View>

        {historico.length === 0 && (
          <View style={s.vazioBox}>
            <Text style={s.vazioEmoji}>📋</Text>
            <Text style={s.vazioTitulo}>Nenhum cálculo ainda</Text>
            <Text style={s.vazioSub}>Faça um cálculo na tela principal para ele aparecer aqui.</Text>
          </View>
        )}

        {historico.map((item, index) => (
          <View key={item.id} style={s.card}>
            <View style={s.cardHeader}>
              <View style={s.numero}>
                <Text style={s.numeroText}>{index + 1}</Text>
              </View>
              <Text style={s.data}>{item.data}</Text>
            </View>

            <View style={s.destaque}>
              <Text style={s.valorGrande}>
                {Math.round(item.resultado.comprimentoComFator).toLocaleString("pt-BR")}
              </Text>
              <Text style={s.unidade}> metros</Text>
            </View>
            <Text style={s.km}>≈ {(item.resultado.comprimentoComFator / 1000).toFixed(2)} km</Text>

            <View style={s.divisor} />

            <View style={s.medidas}>
              {[
                ["Ø Interno", `${item.valores.diametroInterno} mm`],
                ["Ø Externo", `${item.valores.diametroExterno} mm`],
                ["Largura", `${item.valores.largura} mm`],
                ["Cabo", `${item.valores.diametroCabo} mm`],
              ].map(([label, valor]) => (
                <View key={label} style={s.medidaItem}>
                  <Text style={s.medidaLabel}>{label}</Text>
                  <Text style={s.medidaValor}>{valor}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {historico.length > 0 && (
          <TouchableOpacity style={s.btnLimpar} onPress={limparHistorico}>
            <Text style={s.btnLimparText}>🗑 Limpar histórico</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D1B2A" },
  scroll: { paddingBottom: 40 },
  header: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 },
  btnVoltar: { marginBottom: 12 },
  btnVoltarText: { color: "#3B9EFF", fontSize: 14, fontWeight: "600" },
  eyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 4, color: "#3B9EFF", marginBottom: 2 },
  title: { fontSize: 34, fontWeight: "800", color: "#FFFFFF", letterSpacing: -1 },
  sub: { fontSize: 13, color: "#5A7A9A", marginTop: 4 },

  vazioBox: { alignItems: "center", marginTop: 60, paddingHorizontal: 40 },
  vazioEmoji: { fontSize: 48, marginBottom: 16 },
  vazioTitulo: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", marginBottom: 8 },
  vazioSub: { fontSize: 14, color: "#5A7A9A", textAlign: "center", lineHeight: 20 },

  card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: "#112236", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#1E3A5F" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  numero: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#1E3A5F", alignItems: "center", justifyContent: "center", marginRight: 8 },
  numeroText: { color: "#3B9EFF", fontSize: 11, fontWeight: "700" },
  data: { color: "#5A7A9A", fontSize: 12 },
  destaque: { flexDirection: "row", alignItems: "baseline" },
  valorGrande: { fontSize: 34, fontWeight: "800", color: "#FFFFFF", letterSpacing: -1 },
  unidade: { fontSize: 15, color: "#3B9EFF", fontWeight: "600" },
  km: { color: "#8AAFCC", fontSize: 13, marginTop: 2, marginBottom: 10 },
  divisor: { height: 1, backgroundColor: "#1E3A5F", marginBottom: 10 },
  medidas: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  medidaItem: { backgroundColor: "#0D1B2A", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, minWidth: "45%" },
  medidaLabel: { color: "#5A7A9A", fontSize: 10, fontWeight: "600", marginBottom: 2 },
  medidaValor: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },

  btnLimpar: { marginHorizontal: 16, marginTop: 8, paddingVertical: 14, alignItems: "center" },
  btnLimparText: { color: "#FF6B6B", fontSize: 13, fontWeight: "600" },
});
