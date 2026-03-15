# Reanimated 2/3 Worklets — Showcase Design

> **Fase**: 3.1 — Animações Avançadas
> **Plataformas**: Android + Windows
> **Data**: 2026-03-14

## Objetivo

Nova tela `ReanimatedScreen` em ambas as plataformas demonstrando as capacidades exclusivas do Reanimated que a API Animated nativa não oferece (ou faz mal): worklets na UI thread, shared values sem re-renders, gesture-driven animations, layout animations declarativas.

## Dependências

- `react-native-reanimated` — instalar em ambas as plataformas
- `react-native-gesture-handler` — verificar se já está disponível via navigation, instalar se necessário

## Estrutura

- **Arquivo**: `src/screens/ReanimatedScreen.tsx` (em ambos os projetos)
- **Navegação**: Registrar no `HomeStack` + card no `HomeScreen`
- **Layout**: Usa `ScreenContainer` + `Section` existentes para consistência
- **Tema**: Segue o sistema de tema existente (neon dark Android / Fluent Windows)

## 7 Demos

### 1. Shared Values & useAnimatedStyle
- Slider controlando cor, escala e rotação de um card simultaneamente
- Contador de re-renders visível mostrando "0" — prova que UI thread faz tudo
- Demonstra: `useSharedValue`, `useAnimatedStyle`, `withSpring`

### 2. Gesture-Driven (Pan + Snap)
- Bola arrastável com `Gesture.Pan()`
- Ao soltar, snapa para o ponto mais próximo de um grid com spring
- Demonstra: `Gesture.Pan()`, `useAnimatedStyle`, `withSpring`, `runOnJS`

### 3. Scroll-Driven Animations
- Mini ScrollView interna com header que encolhe + parallax
- Header muda escala, opacidade e translação com base no scroll offset
- Demonstra: `useAnimatedScrollHandler`, `interpolate`, shared values

### 4. Layout Animations
- Lista dinâmica com botões Add / Remove / Shuffle
- Itens entram com `FadeInUp.springify()`, saem com `FadeOutDown`
- Reordenação anima com `Layout.springify()`
- Demonstra: `entering`, `exiting`, `layout` props, `LayoutAnimation` presets

### 5. Spring / Timing / Decay Comparison
- 3 bolas lado a lado
- Botão dispara as 3 simultaneamente com builders diferentes:
  - Spring (underdamped, bouncy)
  - Timing (easeInOut cubic)
  - Decay (fling and coast)
- Demonstra: `withSpring`, `withTiming`, `withDecay`, diferenças visuais

### 6. Interpolation Showcase
- Gesture horizontal controlando um shared value
- Interpola simultaneamente: cor (azul→roxo→magenta), tamanho, rotação, border-radius
- Demonstra: `interpolate`, `interpolateColor`, multiple animated styles from one value

### 7. Custom Worklet
- Círculo de progresso animado
- Porcentagem calculada por worklet function customizada (snap to 25%, easing não-linear)
- Demonstra: `'worklet'` directive, funções arbitrárias na UI thread, `useDerivedValue`

## Integração na Navegação

- Adicionar `Reanimated` ao `RootStackParamList` em `types.ts`
- Adicionar tela no `HomeStack.tsx`
- Adicionar card no `HomeScreen.tsx` (com badge "NEW")

## Compatibilidade Windows

- `react-native-reanimated` tem suporte experimental para RN Windows
- Se algum demo não funcionar no Windows, usar `Platform.OS` para fallback gracioso
- Testar cada demo individualmente na plataforma Windows
