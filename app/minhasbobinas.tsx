import {
  StyleSheet, Text, View, TouchableOpacity,
  ScrollView, StatusBar, Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Bobina = {
  id: string;
  nome: string;
  valores: Record<string, string>;
};

export default function MinhasBobinas() {
  const [bobinas, setBobinas] = useState<Bobina[]>([]);
  const router = useRouter();

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const raw = await AsyncStorage.getItem("minhasbobinas");
      if (raw) setBobinas(JSON.parse(raw));
    } catch (e) { console.error(e); }
  };

  const excluir = (id: string, nome: string) => {
    Alert.alert("Excluir bobina", `Deseja excluir "${nome}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir", style: "destructive",
        onPress: async () => {
          const nova = bobinas.filter(b => b.id !== id);
          setBobinas(nova);
          await AsyncStorage.setItem("minhasbobinas", JSON.stringify(nova));
        }
      }
    ]);
  };

  const abrirBobina = (b: Bobina) => {
    router.push({ pathname: "/", params: b.valores });
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2A" />

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.btnVoltar}>
          <Text style={s.btnVoltarText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.eyebrow}>CADASTRADAS</Text>
        <Text style={s.title}>Minhas Bobinas</Text>
        <Text style={s.sub}>{bobinas.length} bobina{bobinas.length !== 1 ? "s" : ""} salva{bobinas.length !== 1 ? "s" : ""}</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {bobinas.length === 0 && (
          <View style={s.vazioBox}>
            <Text style={s.vazioEmoji}>⭐</Text>
            <Text style={s.vazioTitulo}>Nenhuma bobina salva</Text>
            <Text style={s.vazioSub}>Na tela de cálculo, preencha as medidas e toque em ⭐ para salvar uma bobina com nome.</Text>
          </View>
        )}

        {bobinas.map((b) => (
          <TouchableOpacity key={b.id} style={s.card} onPress={() => abrirBobina(b)} activeOpacity={0.8}>
            <View style={s.cardTop}>
              <View style={s.cardIcon}>
                <Text style={s.cardIconText}>🔵</Text>
              </View>
              <View style={s.cardInfo}>
                <Text style={s.cardNome}>{b.nome}</Text>
                <Text style={s.cardSub}>Toque para calcular com estas medidas</Text>
              </View>
              <TouchableOpacity onPress={() => excluir(b.id, b.nome)} style={s.btnExcluir}>
                <Text style={s.btnExcluirText}>🗑</Text>
              </TouchableOpacity>
            </View>

            <View style={s.cardDivisor} />

            <View style={s.cardMedidas}>
              {[
                ["Ø Interno", `${b.valores.diametroInterno} mm`],
                ["Ø Externo", `${b.valores.diametroExterno} mm`],
                ["Largura", `${b.valores.largura} mm`],
                ["Folga", `${b.valores.folga} mm`],
                ["Cabo", `${b.valores.diametroCabo} mm`],
                ["Fator", `${b.valores.fatorEnchimento}%`],
              ].map(([label, valor]) => (
                <View key={label} style={s.medidaItem}>
                  <Text style={s.medidaLabel}>{label}</Text>
                  <Text style={s.medidaValor}>{valor}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      <Text style={s.footer}>BobinaApp © 2025</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D1B2A" },
  header: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: "#0D1B2A" },
  btnVoltar: { marginBottom: 12 },
  btnVoltarText: { color: "#3B9EFF", fontSize: 14, fontWeight: "600" },
  eyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 4, color: "#3B9EFF", marginBottom: 2 },
  title: { fontSize: 34, fontWeight: "800", color: "#FFFFFF", letterSpacing: -1 },
  sub: { fontSize: 13, color: "#5A7A9A", marginTop: 4 },

  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  vazioBox: { alignItems: "center", marginTop: 60, paddingHorizontal: 40 },
  vazioEmoji: { fontSize: 48, marginBottom: 16 },
  vazioTitulo: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", marginBottom: 8 },
  vazioSub: { fontSize: 14, color: "#5A7A9A", textAlign: "center", lineHeight: 22 },

  card: {
    backgroundColor: "#112236", borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: "#1E3A5F", marginBottom: 12,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#1E3A5F", alignItems: "center", justifyContent: "center" },
  cardIconText: { fontSize: 20 },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  cardSub: { fontSize: 11, color: "#5A7A9A", marginTop: 2 },
  btnExcluir: { padding: 8 },
  btnExcluirText: { fontSize: 18 },

  cardDivisor: { height: 1, backgroundColor: "#1E3A5F", marginVertical: 12 },

  cardMedidas: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  medidaItem: {
    backgroundColor: "#0D1B2A", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, minWidth: "30%",
  },
  medidaLabel: { color: "#5A7A9A", fontSize: 10, fontWeight: "600", marginBottom: 2 },
  medidaValor: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },

  footer: { color: "#1A2A3A", fontSize: 11, textAlign: "center", paddingVertical: 8 },
});
