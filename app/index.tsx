import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet, Text,
  TextInput, TouchableOpacity,
  View
} from "react-native";
import Svg, { Line, Text as SvgText } from "react-native-svg";

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

function DiagramaBobina({ scale = 1 }: { scale?: number }) {
  const W = 320 * scale, H = 280 * scale;
  const s = scale;

  const flangeX1 = 90*s, flangeX2 = 250*s;
  const flangeTop = 35*s, flangeBot = 155*s;
  const eixoTop = 75*s, eixoBot = 115*s;
  const folgaTop = 48*s, folgaBot = 142*s;
  const cx = (flangeX1 + flangeX2) / 2;
  const cy = (flangeTop + flangeBot) / 2;
  const caboY = 210*s;
  const caboX1 = 60*s, caboX2 = 260*s;
  const caboDiam = 14*s;

  return (
    <Svg width={W} height={H}>
      {/* Flange esquerda */}
      <Line x1={flangeX1} y1={flangeTop} x2={flangeX1} y2={flangeBot} stroke="#3B9EFF" strokeWidth={3*s} strokeLinecap="round" />
      <Line x1={flangeX1-8*s} y1={flangeTop} x2={flangeX1+8*s} y2={flangeTop} stroke="#3B9EFF" strokeWidth={2.5*s} />
      <Line x1={flangeX1-8*s} y1={flangeBot} x2={flangeX1+8*s} y2={flangeBot} stroke="#3B9EFF" strokeWidth={2.5*s} />

      {/* Flange direita */}
      <Line x1={flangeX2} y1={flangeTop} x2={flangeX2} y2={flangeBot} stroke="#3B9EFF" strokeWidth={3*s} strokeLinecap="round" />
      <Line x1={flangeX2-8*s} y1={flangeTop} x2={flangeX2+8*s} y2={flangeTop} stroke="#3B9EFF" strokeWidth={2.5*s} />
      <Line x1={flangeX2-8*s} y1={flangeBot} x2={flangeX2+8*s} y2={flangeBot} stroke="#3B9EFF" strokeWidth={2.5*s} />

      {/* Eixo superior e inferior */}
      <Line x1={flangeX1} y1={eixoTop} x2={flangeX2} y2={eixoTop} stroke="#3B9EFF" strokeWidth={1.5*s} />
      <Line x1={flangeX1} y1={eixoBot} x2={flangeX2} y2={eixoBot} stroke="#3B9EFF" strokeWidth={1.5*s} />

      {/* Linha do meio do eixo — a linha azul clara que sumiu */}
      <Line x1={flangeX1} y1={cy} x2={flangeX2} y2={cy} stroke="#8AAFCC" strokeWidth={1*s} strokeDasharray={`${4*s},${3*s}`} />

      {/* Enrolamento tracejado topo e base */}
      <Line x1={flangeX1+14*s} y1={folgaTop} x2={flangeX2-14*s} y2={folgaTop} stroke="#8AAFCC" strokeWidth={1.5*s} strokeDasharray={`${5*s},${3*s}`} />
      <Line x1={flangeX1+14*s} y1={folgaBot} x2={flangeX2-14*s} y2={folgaBot} stroke="#8AAFCC" strokeWidth={1.5*s} strokeDasharray={`${5*s},${3*s}`} />

      {/* Faixas de enrolamento — desenhadas ANTES das linhas do eixo */}
      {[55, 65, 75, 130, 140].map((y) => (
        <Line key={y} x1={flangeX1+2*s} y1={y*s} x2={flangeX2-2*s} y2={y*s} stroke="#1E3A5F" strokeWidth={5*s} />
      ))}

      {/* Eixo superior e inferior — desenhados DEPOIS para ficarem visíveis */}
      <Line x1={flangeX1} y1={eixoTop} x2={flangeX2} y2={eixoTop} stroke="#3B9EFF" strokeWidth={1.5*s} />
      <Line x1={flangeX1} y1={eixoBot} x2={flangeX2} y2={eixoBot} stroke="#3B9EFF" strokeWidth={1.5*s} />

      {/* Linha do meio tracejada */}
      <Line x1={flangeX1} y1={cy} x2={flangeX2} y2={cy} stroke="#8AAFCC" strokeWidth={s} strokeDasharray={`${4*s},${3*s}`} />

      {/* COTA Largura Útil */}
      <Line x1={flangeX1+14*s} y1={22*s} x2={flangeX2-14*s} y2={22*s} stroke="#3B9EFF" strokeWidth={s} />
      <Line x1={flangeX1+14*s} y1={18*s} x2={flangeX1+14*s} y2={26*s} stroke="#3B9EFF" strokeWidth={s} />
      <Line x1={flangeX2-14*s} y1={18*s} x2={flangeX2-14*s} y2={26*s} stroke="#3B9EFF" strokeWidth={s} />
      <SvgText x={cx} y={18*s} fontSize={8.5*s} fill="#3B9EFF" textAnchor="middle" fontWeight="bold">Largura Útil</SvgText>

      {/* COTA Ø Externo */}
      <Line x1={flangeX2+20*s} y1={flangeTop} x2={flangeX2+20*s} y2={flangeBot} stroke="#3B9EFF" strokeWidth={s} />
      <Line x1={flangeX2+16*s} y1={flangeTop} x2={flangeX2+24*s} y2={flangeTop} stroke="#3B9EFF" strokeWidth={s} />
      <Line x1={flangeX2+16*s} y1={flangeBot} x2={flangeX2+24*s} y2={flangeBot} stroke="#3B9EFF" strokeWidth={s} />
      <SvgText x={flangeX2+32*s} y={cy+3*s} fontSize={8.5*s} fill="#3B9EFF" textAnchor="middle" fontWeight="bold"
        transform={`rotate(-90, ${flangeX2+32*s}, ${cy})`}>Ø Externo</SvgText>

      {/* COTA Ø Interno */}
      <Line x1={flangeX1-14*s} y1={eixoTop} x2={flangeX1-14*s} y2={eixoBot} stroke="#8AAFCC" strokeWidth={s} />
      <Line x1={flangeX1-18*s} y1={eixoTop} x2={flangeX1-10*s} y2={eixoTop} stroke="#8AAFCC" strokeWidth={s} />
      <Line x1={flangeX1-18*s} y1={eixoBot} x2={flangeX1-10*s} y2={eixoBot} stroke="#8AAFCC" strokeWidth={s} />
      <SvgText x={flangeX1-22*s} y={cy+3*s} fontSize={8.5*s} fill="#8AAFCC" textAnchor="middle" fontWeight="bold"
        transform={`rotate(-90, ${flangeX1-22*s}, ${cy})`}>Ø Interno</SvgText>

      {/* COTA Folga */}
      <Line x1={flangeX2-10*s} y1={flangeTop+2*s} x2={flangeX2-10*s} y2={folgaTop-2*s} stroke="#FFB347" strokeWidth={s} />
      <Line x1={flangeX2-14*s} y1={flangeTop+2*s} x2={flangeX2-6*s} y2={flangeTop+2*s} stroke="#FFB347" strokeWidth={s} />
      <Line x1={flangeX2-14*s} y1={folgaTop-2*s} x2={flangeX2-6*s} y2={folgaTop-2*s} stroke="#FFB347" strokeWidth={s} />
      <SvgText x={flangeX2+8*s} y={(flangeTop+folgaTop)/2+3*s} fontSize={8.5*s} fill="#FFB347" textAnchor="start" fontWeight="bold">Folga</SvgText>

      {/* Fator Enchimento */}
      <SvgText x={cx} y={folgaBot+12*s} fontSize={8*s} fill="#5A7A9A" textAnchor="middle">Fator Enchimento</SvgText>

      {/* Separador */}
      <Line x1={40*s} y1={175*s} x2={280*s} y2={175*s} stroke="#1E3A5F" strokeWidth={s} strokeDasharray={`${4*s},${4*s}`} />

      {/* CABO — contorno */}
      <Line x1={caboX1+30*s} y1={caboY-caboDiam/2} x2={caboX2-10*s} y2={caboY-caboDiam/2} stroke="#7EE8A2" strokeWidth={1.5*s} />
      <Line x1={caboX1+30*s} y1={caboY+caboDiam/2} x2={caboX2-10*s} y2={caboY+caboDiam/2} stroke="#7EE8A2" strokeWidth={1.5*s} />
      <Line x1={caboX1+30*s} y1={caboY-caboDiam/2} x2={caboX1+30*s} y2={caboY+caboDiam/2} stroke="#7EE8A2" strokeWidth={1.5*s} />
      <Line x1={caboX2-10*s} y1={caboY-caboDiam/2} x2={caboX2-10*s} y2={caboY+caboDiam/2} stroke="#7EE8A2" strokeWidth={1.5*s} />
      {/* Linha central cabo */}
      <Line x1={caboX1} y1={caboY} x2={caboX2} y2={caboY} stroke="#8AAFCC" strokeWidth={s} strokeDasharray={`${4*s},${3*s}`} />

      {/* COTA Ø Cabo */}
      <Line x1={caboX2+8*s} y1={caboY-caboDiam/2} x2={caboX2+8*s} y2={caboY+caboDiam/2} stroke="#7EE8A2" strokeWidth={s} />
      <Line x1={caboX2+4*s} y1={caboY-caboDiam/2} x2={caboX2+12*s} y2={caboY-caboDiam/2} stroke="#7EE8A2" strokeWidth={s} />
      <Line x1={caboX2+4*s} y1={caboY+caboDiam/2} x2={caboX2+12*s} y2={caboY+caboDiam/2} stroke="#7EE8A2" strokeWidth={s} />
      <SvgText
      x={caboX2+22*s} y={caboY+4*s}
      fontSize={8.5*s} fill="#7EE8A2" textAnchor="middle" fontWeight="bold"
      transform={`rotate(-90, ${caboX2+22*s}, ${caboY})`}>Ø Cabo
      </SvgText>
    </Svg>
  );
}

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
  const [modalAjuda, setModalAjuda] = useState(false);
  const [nomeBobina, setNomeBobina] = useState("");
  const [modalDiagrama, setModalDiagrama] = useState(false);
  const router = useRouter();

  const params = useLocalSearchParams();

useEffect(() => {
  if (params.diametroInterno && typeof params.diametroInterno === "string") {
    setDi(String(params.diametroInterno));
    setDe(String(params.diametroExterno));
    setLarg(String(params.largura));
    setFolga(String(params.folga));
    setCabo(String(params.diametroCabo));
    setFator(String(params.fatorEnchimento));
  }
}, []);

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
          <Text style={s.eyebrow}>CAPACIDADE EM</Text>
          <Text style={s.title}>Bobinas / Carretéis</Text>
        </View>
        <View style={s.navBtns}>
          <TouchableOpacity style={s.navBtn} onPress={() => setModalAjuda(true)}>
            <Text style={s.navBtnText}>❓</Text>
            <Text style={s.navBtnLabel}>Ajuda</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navBtn} onPress={() => router.push("/historico")}>
            <Text style={s.navBtnText}>📋</Text>
            <Text style={s.navBtnLabel}>Histórico</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navBtn} onPress={() => router.push("/minhasbobinas")}>
            <Text style={s.navBtnText}>⭐</Text>
            <Text style={s.navBtnLabel}>Salvos</Text>
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
            <Text style={s.btnIconeText}>🧹</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnIcone} onPress={() => setModalSalvar(true)} activeOpacity={0.7}>
            <Text style={s.btnIconeText}>💾</Text>
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
                ].map(([l, v]) => (
                  <View key={l} style={s.detalheItem}>
                    <Text style={s.detalheLabel}>{l}</Text>
                    <Text style={s.detalheValor}>{v}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={s.resultadoBruto}>Bruto: {resultado.comprimentoTotal.toFixed(0)} m</Text>
            <View style={s.divisorDiagrama} />
          </>
        ) : null}
        <TouchableOpacity style={s.diagramaContainer} onPress={() => setModalDiagrama(true)} activeOpacity={0.8}>
          <DiagramaBobina scale={resultado ? 0.45 : 1} />
          <Text style={s.diagramaHint}>🔍 Toque para ampliar</Text>
        </TouchableOpacity>
      </View>
      
      {/* MODAL AJUDA */}
      <Modal visible={modalAjuda} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { width: 320 }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: "flex-end", marginBottom: 8 }}>
                <TouchableOpacity onPress={() => setModalAjuda(false)} style={s.btnFechar}>
                  <Text style={s.btnFecharText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={[s.modalTitulo, { marginBottom: 16 }]}>❓ Como usar o app</Text>
              <Text style={s.ajudaSec}>📐 Cálculo de Bobina</Text>
              <Text style={s.ajudaTexto}>Preencha os 6 campos com as medidas do carretel e do cabo, depois toque em CALCULAR. O resultado aparece em metros e km, já com o fator de enchimento aplicado.</Text>
              <Text style={s.ajudaSec}>🧹 Limpar campos</Text>
              <Text style={s.ajudaTexto}>Toque no botão da vassoura para apagar todos os campos e começar um novo cálculo do zero.</Text>
              <Text style={s.ajudaSec}>💾 Salvar Bobina</Text>
              <Text style={s.ajudaTexto}>Preencha as medidas de uma bobina que você usa com frequência e toque em 💾. Digite um nome (ex: "Bobina Linha 3") e salve. Ela ficará guardada em "Salvos".</Text>
              <Text style={s.ajudaSec}>⭐ Minhas Bobinas</Text>
              <Text style={s.ajudaTexto}>Acesse suas bobinas cadastradas. Toque em uma delas para carregar as medidas automaticamente na tela de cálculo. Para excluir, toque no ícone de lixeira ao lado da bobina.</Text>
              <Text style={s.ajudaSec}>📋 Histórico</Text>
              <Text style={s.ajudaTexto}>Guarda automaticamente os últimos 15 cálculos realizados, com data, hora e todas as medidas usadas. Para apagar tudo, use o botão "Limpar histórico".</Text>
              <Text style={s.ajudaSec}>💡 Fator de Enchimento</Text>
              <Text style={s.ajudaTexto}>Corrige a diferença entre o cálculo teórico e a realidade. O padrão de 90% é o mais usado na indústria. Ajuste conforme a experiência com cada tipo de cabo.</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL DIAGRAMA AMPLIADO */}
      <Modal visible={modalDiagrama} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { width: "95%", padding: 16, paddingTop: 12 }]}>
            <View style={{ alignItems: "flex-end", marginBottom: 4 }}>
              <TouchableOpacity onPress={() => setModalDiagrama(false)} style={s.btnFechar}>
                <Text style={s.btnFecharText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={[s.cardTitle, { marginBottom: 12 }]}>DIAGRAMA TÉCNICO</Text>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <DiagramaBobina scale={1.4} />
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL SALVAR BOBINA */}
      <Modal visible={modalSalvar} transparent animationType="fade">
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={s.modalOverlay}>
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
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Text style={s.footer}>BobinaApp © 2025</Text>
    </View>
  );
}

const s = StyleSheet.create({
  diagramaHint: { color: "#2A4A6A", fontSize: 10, textAlign: "center", marginTop: 2 },
  root: { flex: 1, backgroundColor: "#0D1B2A", paddingHorizontal: 14, paddingTop: 48 },
  divisorDiagrama: { height: 1, backgroundColor: "#1E3A5F", marginVertical: 8 },
  diagramaContainer: { alignItems: "center", paddingVertical: 4 },

  // HEADER
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  eyebrow: { fontSize: 8, fontWeight: "700", letterSpacing: 4, color: "#3B9EFF" },
  title: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", letterSpacing: -1 },
  navBtns: { flexDirection: "row", gap: 8 },
  navBtn: { backgroundColor: "#112236", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, alignItems: "center", borderWidth: 1, borderColor: "#1E3A5F" },
  navBtnText: { fontSize: 14 },
  navBtnLabel: { fontSize: 9, color: "#3B9EFF", fontWeight: "600", marginTop: 1 },
  btnFechar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#1E3A5F", alignItems: "center", justifyContent: "center"},
  btnFecharText: { color: "#3B9EFF", fontSize: 16, fontWeight: "700" },

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
  modalCard: { backgroundColor: "#112236", borderRadius: 20, padding: 24, paddingTop: 16, width: 300, maxHeight: "80%", borderWidth: 1, borderColor: "#3B9EFF" },
  modalTitulo: { fontSize: 18, fontWeight: "700", color: "#FFFFFF", marginBottom: 6 },
  modalSub: { fontSize: 13, color: "#5A7A9A", marginBottom: 16 },
  modalInput: { backgroundColor: "#0D1B2A", borderRadius: 10, borderWidth: 1, borderColor: "#1E3A5F", paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#FFFFFF", marginBottom: 16 },
  modalBtns: { flexDirection: "row", gap: 10 },
  modalBtnCancelar: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 10, borderWidth: 1, borderColor: "#1E3A5F" },
  modalBtnCancelarText: { color: "#5A7A9A", fontSize: 14, fontWeight: "600" },
  modalBtnSalvar: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 10, backgroundColor: "#3B9EFF" },
  modalBtnSalvarText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },

  footer: { color: "#1A2A3A", fontSize: 11, textAlign: "center", paddingVertical: 8 },

  ajudaSec: { color: "#3B9EFF", fontSize: 13, fontWeight: "700", marginTop: 14, marginBottom: 4 },
  ajudaTexto: { color: "#8AAFCC", fontSize: 13, lineHeight: 20 },
});
