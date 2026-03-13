import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import {Colors, Radius, Spacing, Typography, neonShadow} from '../../theme';

const AUTOCOMPLETE_OPTIONS = [
  'Retail command center',
  'Fintech onboarding flow',
  'Healthcare appointment suite',
  'Logistics fleet dashboard',
  'Field sales cockpit',
  'Industrial maintenance portal',
  'Learning analytics workspace',
];

const PLATFORM_OPTIONS = ['Android', 'Windows', 'Dual release'] as const;
const TIMELINE_OPTIONS = ['2 weeks', '4 weeks', '8 weeks'] as const;
const OTP_LENGTH = 6;

type ValidationTone = 'default' | 'success' | 'warning' | 'error';
type WizardPlatform = (typeof PLATFORM_OPTIONS)[number];
type WizardTimeline = (typeof TIMELINE_OPTIONS)[number];
type MaskFieldKey = 'phone' | 'cep' | 'cpf' | 'card';

type DemoCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

type FloatingFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  helperText?: string;
  tone?: ValidationTone;
  leftGlyph?: string;
  rightLabel?: string;
  onRightPress?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  inputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'style'>;
};

type MaskState = Record<MaskFieldKey, string>;

type WizardState = {
  leadName: string;
  projectName: string;
  platform: WizardPlatform;
  timeline: WizardTimeline;
  objective: string;
};

type IntakeState = {
  name: string;
  email: string;
  company: string;
  budget: string;
  brief: string;
};

type EditorFormatState = {
  bold: boolean;
  italic: boolean;
  list: boolean;
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function formatCpf(value: string) {
  const digits = digitsOnly(value).slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string) {
  const digits = digitsOnly(value).slice(0, 11);

  if (!digits.length) {
    return '';
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCep(value: string) {
  const digits = digitsOnly(value).slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatCard(value: string) {
  return digitsOnly(value)
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function getToneColor(tone: ValidationTone) {
  switch (tone) {
    case 'success':
      return Colors.success;
    case 'warning':
      return Colors.warning;
    case 'error':
      return Colors.error;
    case 'default':
    default:
      return Colors.textSecondary;
  }
}

function validateEmail(email: string) {
  if (!email.trim()) {
    return {
      tone: 'default' as const,
      message: 'Use a business email to demonstrate inline feedback.',
    };
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return {
      tone: 'success' as const,
      message: 'Looks production-ready.',
    };
  }

  return {
    tone: 'error' as const,
    message: 'Missing a valid domain.',
  };
}

function validatePassword(password: string) {
  if (!password) {
    return {
      tone: 'default' as const,
      message: 'Check length, uppercase letters, and numbers in real time.',
    };
  }

  const strongEnough =
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password);

  if (strongEnough) {
    return {
      tone: 'success' as const,
      message: 'Strong password pattern detected.',
    };
  }

  if (password.length >= 6) {
    return {
      tone: 'warning' as const,
      message: 'Add an uppercase letter and a number.',
    };
  }

  return {
    tone: 'error' as const,
    message: 'Too short for a secure flow.',
  };
}

function isValidCpf(value: string) {
  const digits = digitsOnly(value);

  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) {
    return false;
  }

  const calcDigit = (sliceLength: number) => {
    let total = 0;

    for (let index = 0; index < sliceLength; index += 1) {
      total += Number(digits[index]) * (sliceLength + 1 - index);
    }

    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calcDigit(9) === Number(digits[9]) && calcDigit(10) === Number(digits[10]);
}

function validateCpf(value: string) {
  const digits = digitsOnly(value);

  if (!digits.length) {
    return {
      tone: 'default' as const,
      message: 'Brazilian ID validation stays live as the user types.',
    };
  }

  if (digits.length < 11) {
    return {
      tone: 'warning' as const,
      message: 'CPF is still incomplete.',
    };
  }

  if (isValidCpf(digits)) {
    return {
      tone: 'success' as const,
      message: 'CPF checksum passed.',
    };
  }

  return {
    tone: 'error' as const,
    message: 'Checksum failed. Try a valid CPF.',
  };
}

function validateIntake(state: IntakeState) {
  const errors: Partial<Record<keyof IntakeState, string>> = {};

  if (!state.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!state.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) {
    errors.email = 'Enter a valid email.';
  }

  if (!state.company.trim()) {
    errors.company = 'Company is required.';
  }

  if (!state.budget.trim()) {
    errors.budget = 'Budget is required.';
  }

  if (state.brief.trim().length < 20) {
    errors.brief = 'Add at least 20 characters to describe the project.';
  }

  return errors;
}

function updateMaskedValue(type: MaskFieldKey, value: string) {
  switch (type) {
    case 'phone':
      return formatPhone(value);
    case 'cep':
      return formatCep(value);
    case 'cpf':
      return formatCpf(value);
    case 'card':
      return formatCard(value);
    default:
      return value;
  }
}

function DemoCard({eyebrow, title, description, children}: DemoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      {children}
    </View>
  );
}

function FloatingField({
  label,
  value,
  onChangeText,
  helperText,
  tone = 'default',
  leftGlyph,
  rightLabel,
  onRightPress,
  multiline = false,
  numberOfLines = 1,
  inputProps,
}: FloatingFieldProps) {
  const [focused, setFocused] = useState(false);
  const animation = useRef(new Animated.Value(value ? 1 : 0)).current;
  const active = focused || value.length > 0;
  const toneColor = focused && tone === 'default' ? Colors.primary : getToneColor(tone);
  const borderColor = focused ? Colors.primary : tone === 'default' ? Colors.borderLight : toneColor;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: active ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [active, animation]);

  return (
    <View style={styles.fieldBlock}>
      <View style={[styles.fieldShell, multiline && styles.fieldShellMultiline, {borderColor}]}>
        {leftGlyph ? <Text style={styles.leftGlyph}>{leftGlyph}</Text> : null}

        <Animated.Text
          style={[
            styles.floatingLabel,
            {
              color: toneColor,
              left: leftGlyph ? 44 : 16,
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, -12],
                  }),
                },
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.86],
                  }),
                },
              ],
            },
          ]}>
          {label}
        </Animated.Text>

        <TextInput
          {...inputProps}
          autoCorrect={inputProps?.autoCorrect ?? false}
          onBlur={event => {
            setFocused(false);
            inputProps?.onBlur?.(event);
          }}
          onChangeText={onChangeText}
          onFocus={event => {
            setFocused(true);
            inputProps?.onFocus?.(event);
          }}
          placeholder={active ? inputProps?.placeholder : undefined}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.primary}
          style={[
            styles.textInput,
            multiline && styles.textArea,
            leftGlyph ? styles.textInputWithGlyph : null,
            rightLabel ? styles.textInputWithAction : null,
          ]}
          textAlignVertical={multiline ? 'top' : 'center'}
          value={value}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />

        {rightLabel ? (
          <Pressable onPress={onRightPress} style={styles.fieldAction}>
            <Text style={styles.fieldActionText}>{rightLabel}</Text>
          </Pressable>
        ) : null}
      </View>

      {helperText ? (
        <Text
          style={[
            styles.helperText,
            tone === 'success' && styles.helperSuccess,
            tone === 'warning' && styles.helperWarning,
            tone === 'error' && styles.helperError,
          ]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

function ToolToggle({label, active, onPress}: {label: string; active: boolean; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={[styles.toolButton, active && styles.toolButtonActive]}>
      <Text style={[styles.toolButtonText, active && styles.toolButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function FormsShowcase() {
  const [floatingEmail, setFloatingEmail] = useState('hello@showcase.dev');
  const [notes, setNotes] = useState(
    'Need an input system that feels premium on mobile and desktop.',
  );
  const [password, setPassword] = useState('NeonLaunch9');
  const [showPassword, setShowPassword] = useState(false);
  const [searchValue, setSearchValue] = useState('dashboard');
  const [maskValues, setMaskValues] = useState<MaskState>({
    phone: formatPhone('11987654321'),
    cep: formatCep('04538133'),
    cpf: formatCpf('12345678909'),
    card: formatCard('4242424242424242'),
  });
  const [autocompleteValue, setAutocompleteValue] = useState('log');
  const [autocompleteSelected, setAutocompleteSelected] = useState('Logistics fleet dashboard');
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardMessage, setWizardMessage] = useState(
    'Use the wizard to simulate a scoped intake flow with progress.',
  );
  const [wizardDone, setWizardDone] = useState(false);
  const [wizardState, setWizardState] = useState<WizardState>({
    leadName: 'Matheus',
    projectName: 'Operations cockpit',
    platform: 'Dual release',
    timeline: '4 weeks',
    objective: 'Unify Android field actions with a polished Windows back-office workspace.',
  });
  const [intakeState, setIntakeState] = useState<IntakeState>({
    name: '',
    email: '',
    company: '',
    budget: '',
    brief: '',
  });
  const [intakeErrors, setIntakeErrors] = useState<Partial<Record<keyof IntakeState, string>>>(
    {},
  );
  const [intakeSuccess, setIntakeSuccess] = useState('');
  const [otp, setOtp] = useState('248');
  const otpInputRef = useRef<TextInput | null>(null);
  const [editorValue, setEditorValue] = useState(
    'Launch with onboarding, KPI cards, and a compact approval flow.',
  );
  const [editorFormat, setEditorFormat] = useState<EditorFormatState>({
    bold: true,
    italic: false,
    list: false,
  });

  const emailStatus = validateEmail(floatingEmail);
  const passwordStatus = validatePassword(password);
  const cpfStatus = validateCpf(maskValues.cpf);
  const wizardProgress = (wizardStep + 1) / 3;
  const autocompleteQuery = autocompleteValue.trim().toLowerCase();
  const autocompleteSuggestions = AUTOCOMPLETE_OPTIONS.filter(option => {
    if (!autocompleteQuery) {
      return true;
    }

    return option.toLowerCase().includes(autocompleteQuery);
  }).slice(0, 4);
  const searchMatches = AUTOCOMPLETE_OPTIONS.filter(option =>
    option.toLowerCase().includes(searchValue.trim().toLowerCase()),
  ).slice(0, 3);
  const previewLines = editorValue
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const updateMask = (field: MaskFieldKey, nextValue: string) => {
    setMaskValues(current => ({
      ...current,
      [field]: updateMaskedValue(field, nextValue),
    }));
  };

  const updateWizard = <Key extends keyof WizardState,>(field: Key, value: WizardState[Key]) => {
    setWizardState(current => ({
      ...current,
      [field]: value,
    }));
    setWizardMessage('Use the wizard to simulate a scoped intake flow with progress.');
    setWizardDone(false);
  };

  const canAdvanceWizard =
    wizardStep === 0
      ? wizardState.leadName.trim().length > 1 && wizardState.projectName.trim().length > 3
      : wizardStep === 1
        ? !!wizardState.platform && !!wizardState.timeline
        : wizardState.objective.trim().length > 15;

  const handleWizardNext = () => {
    if (!canAdvanceWizard) {
      setWizardMessage('Complete the required inputs before advancing.');
      setWizardDone(false);
      return;
    }

    if (wizardStep === 2) {
      setWizardDone(true);
      setWizardMessage('Flow completed. Summary is ready for a stakeholder handoff.');
      return;
    }

    setWizardStep(current => current + 1);
    setWizardDone(false);
    setWizardMessage('Progress and field state update together across steps.');
  };

  const handleWizardBack = () => {
    if (wizardStep === 0) {
      return;
    }

    setWizardDone(false);
    setWizardStep(current => current - 1);
    setWizardMessage('Previous steps keep their values intact.');
  };

  const updateIntake = <Key extends keyof IntakeState,>(field: Key, value: IntakeState[Key]) => {
    const nextState = {
      ...intakeState,
      [field]: value,
    };

    setIntakeState(nextState);
    setIntakeSuccess('');

    if (intakeErrors[field]) {
      const nextErrors = validateIntake(nextState);
      setIntakeErrors(current => ({
        ...current,
        [field]: nextErrors[field],
      }));
    }
  };

  const handleIntakeSubmit = () => {
    const errors = validateIntake(intakeState);
    setIntakeErrors(errors);

    if (Object.keys(errors).length > 0) {
      setIntakeSuccess('');
      return;
    }

    setIntakeSuccess('Validation passed. The form is ready to submit or persist.');
  };

  const toggleFormat = (field: keyof EditorFormatState) => {
    setEditorFormat(current => ({
      ...current,
      [field]: !current[field],
    }));
  };

  return (
    <View style={styles.stack}>
      <DemoCard
        eyebrow="Phase 1.2 live"
        title="Inputs, forms, masks, and composition flows"
        description="This layer turns the Components screen into a real form lab. Floating labels, inline validation, autocomplete, wizard steps, OTP, and rich text all run with core React Native primitives.">
        <View style={styles.statGrid}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>11</Text>
            <Text style={styles.statLabel}>checklist items delivered</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>new dependencies added</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>1.2</Text>
            <Text style={styles.statLabel}>phase completed</Text>
          </View>
        </View>
      </DemoCard>

      <DemoCard
        eyebrow="Field system"
        title="Floating labels, textarea, password toggle, and search"
        description="The same field shell now supports animated labels, multiline content, revealable passwords, and search with clear actions for reusable product forms.">
        <FloatingField
          label="Work email"
          value={floatingEmail}
          onChangeText={setFloatingEmail}
          helperText={emailStatus.message}
          tone={emailStatus.tone}
          leftGlyph="@"
          inputProps={{
            autoCapitalize: 'none',
            keyboardType: 'email-address',
            placeholder: 'team@client.com',
          }}
        />

        <FloatingField
          label="Project notes"
          value={notes}
          onChangeText={setNotes}
          helperText="Multiline fields stay inside the same visual system."
          multiline
          numberOfLines={4}
          inputProps={{
            autoCapitalize: 'sentences',
            placeholder: 'Describe the experience or workflow',
          }}
        />

        <FloatingField
          label="Admin password"
          value={password}
          onChangeText={setPassword}
          helperText={passwordStatus.message}
          tone={passwordStatus.tone}
          rightLabel={showPassword ? 'Hide' : 'Show'}
          onRightPress={() => setShowPassword(current => !current)}
          inputProps={{
            secureTextEntry: !showPassword,
            autoCapitalize: 'none',
            placeholder: 'Enter a secure password',
          }}
        />

        <FloatingField
          label="Search components"
          value={searchValue}
          onChangeText={setSearchValue}
          helperText={
            searchValue
              ? `${searchMatches.length} matching templates in the local showcase dataset.`
              : 'Search with an inline icon and a one-tap clear action.'
          }
          tone={searchValue ? 'success' : 'default'}
          leftGlyph={'\u2315'}
          rightLabel={searchValue ? 'Clear' : undefined}
          onRightPress={() => setSearchValue('')}
          inputProps={{
            placeholder: 'Search demos or templates',
          }}
        />

        {searchMatches.length > 0 ? (
          <View style={styles.resultWrap}>
            {searchMatches.map(match => (
              <View key={match} style={styles.resultPill}>
                <Text style={styles.resultPillText}>{match}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </DemoCard>

      <DemoCard
        eyebrow="Validation layer"
        title="Real-time validation, masking, and suggestions"
        description="Email, password, and CPF feedback react instantly. Masking covers four common Brazilian and commerce patterns, while autocomplete surfaces scoped options without leaving the keyboard flow.">
        <View style={styles.validationGrid}>
          <View style={styles.validationItem}>
            <Text style={styles.validationLabel}>Email</Text>
            <View style={[styles.validationBadge, styles.validationSuccess]}>
              <Text style={styles.validationBadgeText}>{emailStatus.tone.toUpperCase()}</Text>
            </View>
            <Text style={styles.validationCopy}>{emailStatus.message}</Text>
          </View>

          <View style={styles.validationItem}>
            <Text style={styles.validationLabel}>Password</Text>
            <View
              style={[
                styles.validationBadge,
                passwordStatus.tone === 'success'
                  ? styles.validationSuccess
                  : passwordStatus.tone === 'warning'
                    ? styles.validationWarning
                    : passwordStatus.tone === 'error'
                      ? styles.validationError
                      : styles.validationNeutral,
              ]}>
              <Text style={styles.validationBadgeText}>{passwordStatus.tone.toUpperCase()}</Text>
            </View>
            <Text style={styles.validationCopy}>{passwordStatus.message}</Text>
          </View>

          <View style={styles.validationItem}>
            <Text style={styles.validationLabel}>CPF</Text>
            <View
              style={[
                styles.validationBadge,
                cpfStatus.tone === 'success'
                  ? styles.validationSuccess
                  : cpfStatus.tone === 'warning'
                    ? styles.validationWarning
                    : cpfStatus.tone === 'error'
                      ? styles.validationError
                      : styles.validationNeutral,
              ]}>
              <Text style={styles.validationBadgeText}>{cpfStatus.tone.toUpperCase()}</Text>
            </View>
            <Text style={styles.validationCopy}>{cpfStatus.message}</Text>
          </View>
        </View>

        <View style={styles.maskGrid}>
          <FloatingField
            label="Phone mask"
            value={maskValues.phone}
            onChangeText={value => updateMask('phone', value)}
            helperText="(99) 99999-9999"
            inputProps={{
              keyboardType: 'number-pad',
            }}
          />

          <FloatingField
            label="CEP mask"
            value={maskValues.cep}
            onChangeText={value => updateMask('cep', value)}
            helperText="99999-999"
            inputProps={{
              keyboardType: 'number-pad',
            }}
          />

          <FloatingField
            label="CPF mask"
            value={maskValues.cpf}
            onChangeText={value => updateMask('cpf', value)}
            helperText={cpfStatus.message}
            tone={cpfStatus.tone}
            inputProps={{
              keyboardType: 'number-pad',
            }}
          />

          <FloatingField
            label="Card mask"
            value={maskValues.card}
            onChangeText={value => updateMask('card', value)}
            helperText="9999 9999 9999 9999"
            inputProps={{
              keyboardType: 'number-pad',
            }}
          />
        </View>

        <View style={styles.autocompleteBlock}>
          <FloatingField
            label="Autocomplete template"
            value={autocompleteValue}
            onChangeText={value => {
              setAutocompleteValue(value);
              setAutocompleteSelected('');
            }}
            helperText={
              autocompleteSelected
                ? `Selected suggestion: ${autocompleteSelected}`
                : 'Filter local suggestions in a dropdown below the field.'
            }
            tone={autocompleteSelected ? 'success' : 'default'}
            inputProps={{
              placeholder: 'Type a vertical or use case',
            }}
          />

          <View style={styles.suggestionList}>
            {autocompleteSuggestions.map(option => (
              <Pressable
                key={option}
                onPress={() => {
                  setAutocompleteSelected(option);
                  setAutocompleteValue(option);
                }}
                style={[
                  styles.suggestionRow,
                  autocompleteSelected === option && styles.suggestionRowActive,
                ]}>
                <Text
                  style={[
                    styles.suggestionText,
                    autocompleteSelected === option && styles.suggestionTextActive,
                  ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </DemoCard>

      <DemoCard
        eyebrow="Flow orchestration"
        title="Wizard steps, progress bar, and full-form validation"
        description="Complex forms need pacing. The wizard demonstrates progressive disclosure, while the intake form validates every field and returns clear error or success feedback.">
        <View style={styles.wizardCard}>
          <View style={styles.wizardHeader}>
            <View style={styles.valueCopy}>
              <Text style={styles.sectionTitle}>Multi-step project wizard</Text>
              <Text style={styles.sectionDescription}>{wizardMessage}</Text>
            </View>
            <Text style={styles.valueBadge}>
              Step {wizardStep + 1}/3
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {width: `${wizardProgress * 100}%`}]} />
          </View>

          <View style={styles.stepIndicatorRow}>
            {[0, 1, 2].map(step => (
              <View key={step} style={styles.stepIndicatorItem}>
                <View
                  style={[
                    styles.stepDot,
                    step <= wizardStep && styles.stepDotActive,
                    wizardDone && step === 2 && styles.stepDotDone,
                  ]}
                />
                <Text style={styles.stepLabel}>
                  {step === 0 ? 'Discovery' : step === 1 ? 'Scope' : 'Launch'}
                </Text>
              </View>
            ))}
          </View>

          {wizardStep === 0 ? (
            <View style={styles.sectionStack}>
              <FloatingField
                label="Lead name"
                value={wizardState.leadName}
                onChangeText={value => updateWizard('leadName', value)}
                helperText="Step 1 keeps the identity and project context."
              />
              <FloatingField
                label="Project name"
                value={wizardState.projectName}
                onChangeText={value => updateWizard('projectName', value)}
                helperText="Give the proposal a strong working title."
              />
            </View>
          ) : null}

          {wizardStep === 1 ? (
            <View style={styles.sectionStack}>
              <View style={styles.choiceGroup}>
                <Text style={styles.choiceTitle}>Platform</Text>
                <View style={styles.choiceWrap}>
                  {PLATFORM_OPTIONS.map(option => {
                    const selected = wizardState.platform === option;

                    return (
                      <Pressable
                        key={option}
                        onPress={() => updateWizard('platform', option)}
                        style={[styles.choiceChip, selected && styles.choiceChipActive]}>
                        <Text
                          style={[
                            styles.choiceChipText,
                            selected && styles.choiceChipTextActive,
                          ]}>
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.choiceGroup}>
                <Text style={styles.choiceTitle}>Timeline</Text>
                <View style={styles.choiceWrap}>
                  {TIMELINE_OPTIONS.map(option => {
                    const selected = wizardState.timeline === option;

                    return (
                      <Pressable
                        key={option}
                        onPress={() => updateWizard('timeline', option)}
                        style={[styles.choiceChip, selected && styles.choiceChipActive]}>
                        <Text
                          style={[
                            styles.choiceChipText,
                            selected && styles.choiceChipTextActive,
                          ]}>
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          ) : null}

          {wizardStep === 2 ? (
            <View style={styles.sectionStack}>
              <FloatingField
                label="Outcome objective"
                value={wizardState.objective}
                onChangeText={value => updateWizard('objective', value)}
                helperText="Last step captures intent before submission."
                tone={wizardDone ? 'success' : 'default'}
                multiline
                numberOfLines={4}
                inputProps={{
                  autoCapitalize: 'sentences',
                  placeholder: 'Describe the business outcome',
                }}
              />

              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>Flow summary</Text>
                <Text style={styles.summaryText}>
                  {wizardState.leadName} requested {wizardState.projectName} for{' '}
                  {wizardState.platform.toLowerCase()} delivery in {wizardState.timeline.toLowerCase()}.
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <Pressable
              onPress={handleWizardBack}
              style={[styles.secondaryButton, wizardStep === 0 && styles.buttonMuted]}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
            <Pressable onPress={handleWizardNext} style={[styles.primaryButton, styles.flexButton]}>
              <Text style={styles.primaryButtonText}>
                {wizardStep === 2 ? 'Complete flow' : 'Next step'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.fullFormCard}>
          <View style={styles.wizardHeader}>
            <View style={styles.valueCopy}>
              <Text style={styles.sectionTitle}>Validated intake form</Text>
              <Text style={styles.sectionDescription}>
                Submit to surface error messages across all required fields.
              </Text>
            </View>
            <Text style={styles.valueBadge}>Errors inline</Text>
          </View>

          <FloatingField
            label="Contact name"
            value={intakeState.name}
            onChangeText={value => updateIntake('name', value)}
            helperText={intakeErrors.name}
            tone={intakeErrors.name ? 'error' : 'default'}
          />

          <FloatingField
            label="Contact email"
            value={intakeState.email}
            onChangeText={value => updateIntake('email', value)}
            helperText={intakeErrors.email}
            tone={intakeErrors.email ? 'error' : 'default'}
            inputProps={{
              autoCapitalize: 'none',
              keyboardType: 'email-address',
            }}
          />

          <FloatingField
            label="Company"
            value={intakeState.company}
            onChangeText={value => updateIntake('company', value)}
            helperText={intakeErrors.company}
            tone={intakeErrors.company ? 'error' : 'default'}
          />

          <FloatingField
            label="Budget range"
            value={intakeState.budget}
            onChangeText={value => updateIntake('budget', value)}
            helperText={intakeErrors.budget}
            tone={intakeErrors.budget ? 'error' : 'default'}
            inputProps={{
              placeholder: '$25k - $40k',
            }}
          />

          <FloatingField
            label="Project brief"
            value={intakeState.brief}
            onChangeText={value => updateIntake('brief', value)}
            helperText={intakeErrors.brief}
            tone={intakeErrors.brief ? 'error' : 'default'}
            multiline
            numberOfLines={4}
            inputProps={{
              autoCapitalize: 'sentences',
            }}
          />

          {intakeSuccess ? (
            <View style={styles.successBanner}>
              <Text style={styles.successBannerText}>{intakeSuccess}</Text>
            </View>
          ) : null}

          <Pressable onPress={handleIntakeSubmit} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Validate form</Text>
          </Pressable>
        </View>
      </DemoCard>

      <DemoCard
        eyebrow="Security & content"
        title="OTP input and rich text editor"
        description="These patterns finish the form layer: secure code capture for verification flows and a lightweight content editor with formatting toggles and preview output.">
        <View style={styles.otpCard}>
          <View style={styles.wizardHeader}>
            <View style={styles.valueCopy}>
              <Text style={styles.sectionTitle}>Pin Code / OTP input</Text>
              <Text style={styles.sectionDescription}>
                Tap the boxes to focus the hidden numeric input.
              </Text>
            </View>
            <Text style={styles.valueBadge}>
              {otp.length}/{OTP_LENGTH}
            </Text>
          </View>

          <Pressable onPress={() => otpInputRef.current?.focus()} style={styles.otpRow}>
            {Array.from({length: OTP_LENGTH}).map((_, index) => {
              const digit = otp[index] ?? '';
              const active = index === otp.length && otp.length < OTP_LENGTH;

              return (
                <View
                  key={`otp-${index}`}
                  style={[
                    styles.otpCell,
                    digit && styles.otpCellFilled,
                    active && styles.otpCellActive,
                  ]}>
                  <Text style={styles.otpDigit}>{digit || '\u2022'}</Text>
                </View>
              );
            })}

            <TextInput
              ref={otpInputRef}
              value={otp}
              onChangeText={value => setOtp(digitsOnly(value).slice(0, OTP_LENGTH))}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              style={styles.hiddenOtpInput}
            />
          </Pressable>

          <View style={styles.resultWrap}>
            <View style={[styles.resultPill, otp.length === OTP_LENGTH && styles.resultPillActive]}>
              <Text
                style={[
                  styles.resultPillText,
                  otp.length === OTP_LENGTH && styles.resultPillTextActive,
                ]}>
                {otp.length === OTP_LENGTH ? 'Verification ready' : 'Waiting for full code'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.editorCard}>
          <View style={styles.wizardHeader}>
            <View style={styles.valueCopy}>
              <Text style={styles.sectionTitle}>Rich text editor</Text>
              <Text style={styles.sectionDescription}>
                Toggle bold, italic, and list rendering, then preview the resulting content block.
              </Text>
            </View>
            <Text style={styles.valueBadge}>B / I / List</Text>
          </View>

          <View style={styles.toolbarRow}>
            <ToolToggle label="Bold" active={editorFormat.bold} onPress={() => toggleFormat('bold')} />
            <ToolToggle
              label="Italic"
              active={editorFormat.italic}
              onPress={() => toggleFormat('italic')}
            />
            <ToolToggle label="List" active={editorFormat.list} onPress={() => toggleFormat('list')} />
          </View>

          <FloatingField
            label="Editor content"
            value={editorValue}
            onChangeText={setEditorValue}
            helperText="Preview updates immediately below the input."
            multiline
            numberOfLines={5}
            inputProps={{
              autoCapitalize: 'sentences',
              placeholder: 'Type a launch note or release summary',
            }}
          />

          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Preview</Text>
            {editorFormat.list ? (
              <View style={styles.previewList}>
                {(previewLines.length ? previewLines : ['Add a few lines to see list formatting.']).map(
                  (line, index) => (
                    <View key={`${index}-${line}`} style={styles.previewListItem}>
                      <Text style={styles.previewBullet}>{'\u2022'}</Text>
                      <Text
                        style={[
                          styles.previewText,
                          editorFormat.bold && styles.previewTextBold,
                          editorFormat.italic && styles.previewTextItalic,
                        ]}>
                        {line}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            ) : (
              <Text
                style={[
                  styles.previewText,
                  editorFormat.bold && styles.previewTextBold,
                  editorFormat.italic && styles.previewTextItalic,
                ]}>
                {editorValue || 'Preview your formatted content here.'}
              </Text>
            )}
          </View>
        </View>
      </DemoCard>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.secondary,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  cardDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statPill: {
    flexGrow: 1,
    minWidth: 110,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statValue: {
    ...Typography.h4,
    color: Colors.white,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  fieldBlock: {
    gap: Spacing.xs,
  },
  fieldShell: {
    minHeight: 68,
    borderRadius: Radius.lg,
    borderWidth: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
  },
  fieldShellMultiline: {
    minHeight: 136,
    justifyContent: 'flex-start',
  },
  floatingLabel: {
    ...Typography.caption,
    position: 'absolute',
    top: 20,
    backgroundColor: Colors.surface,
    paddingHorizontal: 6,
    zIndex: 2,
  },
  textInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    paddingTop: 26,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  textInputWithGlyph: {
    paddingLeft: 44,
  },
  textInputWithAction: {
    paddingRight: 72,
  },
  textArea: {
    minHeight: 112,
  },
  leftGlyph: {
    position: 'absolute',
    left: Spacing.md,
    top: 25,
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  fieldAction: {
    position: 'absolute',
    right: Spacing.md,
    top: 22,
    minHeight: 28,
    justifyContent: 'center',
  },
  fieldActionText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  helperSuccess: {
    color: Colors.success,
  },
  helperWarning: {
    color: Colors.warning,
  },
  helperError: {
    color: Colors.error,
  },
  resultWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  resultPill: {
    backgroundColor: Colors.bgLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultPillActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  resultPillText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  resultPillTextActive: {
    color: Colors.primary,
  },
  validationGrid: {
    gap: Spacing.sm,
  },
  validationItem: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  validationLabel: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  validationBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  validationNeutral: {
    backgroundColor: Colors.accent + '20',
  },
  validationSuccess: {
    backgroundColor: Colors.success + '20',
  },
  validationWarning: {
    backgroundColor: Colors.warning + '20',
  },
  validationError: {
    backgroundColor: Colors.error + '20',
  },
  validationBadgeText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  validationCopy: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  maskGrid: {
    gap: Spacing.md,
  },
  autocompleteBlock: {
    gap: Spacing.sm,
  },
  suggestionList: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  suggestionRowActive: {
    backgroundColor: Colors.primary + '14',
  },
  suggestionText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  suggestionTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  wizardCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  wizardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  valueCopy: {
    flex: 1,
    gap: 2,
  },
  valueBadge: {
    ...Typography.caption,
    color: Colors.secondary,
    backgroundColor: Colors.secondary + '16',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  sectionDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.secondary,
    ...neonShadow(Colors.secondary, 8),
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  stepIndicatorItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  stepDotActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  stepDotDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  stepLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  sectionStack: {
    gap: Spacing.md,
  },
  choiceGroup: {
    gap: Spacing.sm,
  },
  choiceTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  choiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  choiceChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
  },
  choiceChipActive: {
    backgroundColor: Colors.secondary + '18',
    borderColor: Colors.secondary,
  },
  choiceChipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  choiceChipTextActive: {
    color: Colors.secondary,
    fontWeight: '700',
  },
  summaryBox: {
    backgroundColor: Colors.bgLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  summaryTitle: {
    ...Typography.caption,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  flexButton: {
    flex: 1,
  },
  primaryButtonText: {
    ...Typography.bodySmall,
    color: Colors.bg,
    fontWeight: '800',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  secondaryButtonText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  buttonMuted: {
    opacity: 0.6,
  },
  fullFormCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  successBanner: {
    backgroundColor: Colors.success + '16',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.success + '50',
    padding: Spacing.md,
  },
  successBannerText: {
    ...Typography.bodySmall,
    color: Colors.success,
  },
  otpCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  otpRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  otpCell: {
    flex: 1,
    minHeight: 58,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpCellFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '18',
  },
  otpCellActive: {
    borderColor: Colors.secondary,
    ...neonShadow(Colors.secondary, 6),
  },
  otpDigit: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  hiddenOtpInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  editorCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  toolbarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  toolButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toolButtonActive: {
    backgroundColor: Colors.primary + '18',
    borderColor: Colors.primary,
  },
  toolButtonText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  toolButtonTextActive: {
    color: Colors.primary,
  },
  previewCard: {
    backgroundColor: Colors.bgLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  previewTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  previewText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  previewTextBold: {
    fontWeight: '800',
  },
  previewTextItalic: {
    fontStyle: 'italic',
  },
  previewList: {
    gap: Spacing.sm,
  },
  previewListItem: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  previewBullet: {
    ...Typography.body,
    color: Colors.secondary,
  },
});
