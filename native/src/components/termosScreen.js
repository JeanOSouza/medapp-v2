import React from "react";
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme"; // Certifique-se de que o caminho do seu theme está correto

export default function TermosScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* CABEÇALHO DA TELA */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text || "#333"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Políticas e Termos</Text>
        <View style={{ width: 24 }} />{" "}
        {/* Espaçador para centralizar o título */}
      </View>

      {/* CONTEÚDO DO DOCUMENTO */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.docTitle}>
          Termos de Uso e Política de Privacidade
        </Text>
        <Text style={styles.date}>Última atualização: 25 de maio de 2026</Text>

        <Text style={styles.paragraph}>
          Bem-vindo ao <Text style={styles.bold}>MedApp</Text>. Ao instalar e
          utilizar nosso aplicativo, você concorda com os presentes Termos de
          Uso e Política de Privacidade. Se você não concordar com qualquer uma
          das condições dispostas, orientamos que não utilize o aplicativo e
          realize a sua desinstalação.
        </Text>

        <View style={styles.divider} />

        {/* PARTE 1: TERMOS DE USO */}
        <Text style={styles.sectionHeader}>PARTE 1: TERMOS DE USO</Text>

        <Text style={styles.heading}>1. Objeto do Aplicativo</Text>
        <Text style={styles.paragraph}>
          O MedApp é uma ferramenta de software desenvolvida para atuar como
          assistente pessoal de medicação. Suas principais funcionalidades
          incluem o cadastro e agendamento automatizado de rotinas de
          medicamentos, o disparo de alertas visuais/notificações de horários e
          o controle do histórico de consumo.
        </Text>

        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>⚠️ AVISO IMPORTANTE</Text>
          <Text style={styles.alertText}>
            O MedApp é estritamente uma ferramenta de suporte técnico e
            organização pessoal. O aplicativo{" "}
            <Text style={styles.bold}>NÃO</Text> fornece conselhos médicos,
            diagnósticos, tratamentos ou prescrições. Falhas técnicas
            decorrentes do dispositivo do usuário (como falta de bateria,
            desligamento de notificações pelo sistema operacional ou ausência de
            rede) não são de nossa responsabilidade.
          </Text>
        </View>

        <Text style={styles.heading}>2. Propriedade Intelectual</Text>
        <Text style={styles.paragraph}>
          O design, código-fonte, marcas, logotipos e arquitetura do MedApp são
          de propriedade exclusiva de seus desenvolvedores. É proibida qualquer
          engenharia reversa, cópia ou distribuição comercial não autorizada do
          software.
        </Text>

        <View style={styles.divider} />

        {/* PARTE 2: PRIVACIDADE */}
        <Text style={styles.sectionHeader}>
          PARTE 2: POLÍTICA DE PRIVACIDADE (LGPD)
        </Text>

        <Text style={styles.heading}>1. Dados Coletados</Text>
        <Text style={styles.paragraph}>
          Em conformidade com a Lei Geral de Proteção de Dados (Lei nº
          13.709/18), o MedApp coleta:
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>Dados de Cadastro:</Text> Nome de usuário,
          e-mail e credenciais de acesso (criptografadas) necessárias para a
          autenticação.
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>Dados Sensíveis de Saúde:</Text> Nomes de
          medicamentos, dosagens, horários de administração e o histórico de
          marcação de doses consumidas.
        </Text>
        <Text style={styles.bullet}>
          • <Text style={styles.bold}>Dados Técnicos:</Text> Identificadores
          únicos do aparelho (tokens de notificação) e status de conectividade.
        </Text>

        <Text style={styles.heading}>2. Finalidade do Tratamento</Text>
        <Text style={styles.paragraph}>
          Todos os dados coletados possuem a única finalidade operacional de
          disparar os alertas configurados no horário exato, exibir o histórico
          para seu acompanhamento pessoal e sincronizar com segurança as
          informações entre o banco local e a nuvem (PostgreSQL).
        </Text>

        <Text style={styles.heading}>3. Segurança e Compartilhamento</Text>
        <Text style={styles.paragraph}>
          Tokens de sessão locais são gerenciados via{" "}
          <Text style={styles.italic}>AsyncStorage</Text>. Os dados enviados
          para a nuvem utilizam conexões criptografadas HTTPS.{" "}
          <Text style={styles.bold}>
            O MedApp não vende e não compartilha dados pessoais ou de saúde com
            terceiros
          </Text>{" "}
          (como laboratórios, farmácias ou seguradoras).
        </Text>

        <Text style={styles.heading}>4. Seus Direitos</Text>
        <Text style={styles.paragraph}>
          A qualquer momento, você poderá acessar, retificar ou excluir
          definitivamente sua conta e apagar todo o histórico de medicamentos
          armazenado na nuvem diretamente através da aba de Perfil do
          aplicativo.
        </Text>

        <View style={styles.footerSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  scrollContent: {
    padding: 20,
  },
  docTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 6,
    lineHeight: 28,
  },
  date: {
    fontSize: 14,
    color: "#777",
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.secondary || "#007BFF",
    letterSpacing: 1,
    marginTop: 15,
    marginBottom: 10,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginTop: 15,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 12,
    textAlign: "justify",
  },
  bullet: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginLeft: 10,
    marginBottom: 6,
  },
  bold: {
    fontWeight: "bold",
    color: "#222",
  },
  italic: {
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: "#eaeaea",
    marginVertical: 15,
  },
  alertBox: {
    backgroundColor: "#fff3cd",
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
    padding: 14,
    borderRadius: 6,
    marginVertical: 15,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#856404",
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: "#856404",
    lineHeight: 20,
    textAlign: "justify",
  },
  footerSpacing: {
    height: 40,
  },
});
