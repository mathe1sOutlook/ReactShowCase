import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions} from 'react-native';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing} from '../theme';

type Flow = 'login' | 'signup' | 'recovery';
type GateMode = 'pin' | 'pattern';
type TwoFactorMethod = 'sms' | 'app' | 'email';

function isEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

function ProviderButton({
  label,
  tone,
  onPress,
}: {
  label: string;
  tone: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.providerButton, {borderColor: tone + '55'}]} onPress={onPress}>
      <Text style={[styles.providerText, {color: tone}]}>{label}</Text>
    </Pressable>
  );
}

function OtpCells({value}: {value: string}) {
  const digits = Array.from({length: 6}, (_, index) => value[index] ?? '');
  return (
    <View style={styles.otpRow}>
      {digits.map((digit, index) => (
        <View key={index} style={styles.otpCell}>
          <Text style={styles.otpDigit}>{digit || '-'}</Text>
        </View>
      ))}
    </View>
  );
}

export default function AuthScreen() {
  const {width} = useWindowDimensions();
  const fullWidth = width - Spacing.lg * 2;
  const cardWidth = width >= 1080 ? (fullWidth - Spacing.md) / 2 : fullWidth;
  const [flow, setFlow] = useState<Flow>('login');
  const [loginEmail, setLoginEmail] = useState('mathe@showcase.dev');
  const [loginPassword, setLoginPassword] = useState('showcase123');
  const [loginStatus, setLoginStatus] = useState('Credentials ready for sign-in.');
  const [rememberMe, setRememberMe] = useState(true);
  const [signupName, setSignupName] = useState('Mathe');
  const [signupEmail, setSignupEmail] = useState('mathe@showcase.dev');
  const [signupPassword, setSignupPassword] = useState('showcase123');
  const [signupConfirm, setSignupConfirm] = useState('showcase123');
  const [signupStatus, setSignupStatus] = useState('Create a new workspace account.');
  const [recoveryEmail, setRecoveryEmail] = useState('mathe@showcase.dev');
  const [recoveryStatus, setRecoveryStatus] = useState('Password reset links will land here.');
  const [socialStatus, setSocialStatus] = useState('No social provider selected.');
  const [biometricStatus, setBiometricStatus] = useState('Biometric gate idle.');
  const [gateMode, setGateMode] = useState<GateMode>('pin');
  const [pinCode, setPinCode] = useState('');
  const [pinStatus, setPinStatus] = useState('PIN code 2580 unlocks the preview.');
  const [patternSequence, setPatternSequence] = useState<number[]>([]);
  const [patternStatus, setPatternStatus] = useState('Pattern 1-4-7-8-9 unlocks the preview.');
  const [twoFactorMethod, setTwoFactorMethod] = useState<TwoFactorMethod>('app');
  const [otp, setOtp] = useState('');
  const [twoFactorStatus, setTwoFactorStatus] = useState('Use 431298 to verify the current challenge.');

  const runLogin = () => {
    if (!isEmail(loginEmail) || loginPassword.length < 8) {
      setLoginStatus('Enter a valid email and at least 8 password characters.');
      return;
    }
    setLoginStatus(`Signed in as ${loginEmail}${rememberMe ? ' with device trust enabled.' : '.'}`);
  };

  const runSignup = () => {
    if (signupName.trim().length < 2) {
      setSignupStatus('A display name with at least 2 characters is required.');
      return;
    }
    if (!isEmail(signupEmail)) {
      setSignupStatus('Provide a valid signup email.');
      return;
    }
    if (signupPassword.length < 8 || signupPassword !== signupConfirm) {
      setSignupStatus('Passwords must match and stay at least 8 characters long.');
      return;
    }
    setSignupStatus(`Workspace account prepared for ${signupName.trim()}.`);
  };

  const runRecovery = () => {
    if (!isEmail(recoveryEmail)) {
      setRecoveryStatus('Enter a valid recovery email before sending.');
      return;
    }
    setRecoveryStatus(`Recovery link queued for ${recoveryEmail}.`);
  };

  const runBiometric = () => {
    setBiometricStatus(Math.random() > 0.22 ? 'Biometric auth approved.' : 'Biometric auth denied. Try PIN fallback.');
  };

  const pushPinDigit = (digit: string) => {
    const next = (pinCode + digit).slice(0, 4);
    setPinCode(next);
    if (next.length === 4) {
      setPinStatus(next === '2580' ? 'PIN unlocked the secure view.' : 'Wrong PIN. Clear and try again.');
    }
  };

  const pushPatternNode = (node: number) => {
    if (patternSequence.includes(node) || patternSequence.length >= 5) {
      return;
    }
    const next = [...patternSequence, node];
    setPatternSequence(next);
    if (next.length === 5) {
      setPatternStatus(next.join('') === '14789' ? 'Pattern unlocked the secure view.' : 'Wrong pattern. Reset and try again.');
    }
  };

  const verifyOtp = () => {
    if (otp === '431298') {
      setTwoFactorStatus(`Two-factor challenge passed with ${twoFactorMethod.toUpperCase()}.`);
      return;
    }
    setTwoFactorStatus('Invalid code. Use 431298 for the demo challenge.');
  };

  return (
    <ScreenContainer>
      <View style={styles.root}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PHASE 8.2</Text>
          <Text style={styles.title}>Auth Demo</Text>
          <Text style={styles.body}>
            Polished login and signup flows with biometric entry, PIN and pattern lock, social
            providers, password recovery and two-factor verification.
          </Text>
          <View style={styles.pills}>
            <View style={styles.pill}><Text style={styles.pillText}>7 demos</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>{flow}</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>{twoFactorMethod.toUpperCase()} 2FA</Text></View>
          </View>
        </View>

        <View style={[styles.card, {width: fullWidth}]}>
          <View style={styles.wrap}>
            {(['login', 'signup', 'recovery'] as Flow[]).map(nextFlow => (
              <Pressable
                key={nextFlow}
                style={[styles.smallAction, flow === nextFlow && styles.smallActionActive]}
                onPress={() => setFlow(nextFlow)}>
                <Text style={flow === nextFlow ? styles.smallActionTextActive : styles.smallActionText}>
                  {nextFlow}
                </Text>
              </Pressable>
            ))}
          </View>

          {flow === 'login' ? (
            <View style={styles.formBlock}>
              <Text style={styles.cardTitle}>Login Screen</Text>
              <Text style={styles.cardSubtitle}>Polished sign-in form with remember-me and social handoff.</Text>
              <TextInput
                style={styles.input}
                value={loginEmail}
                onChangeText={setLoginEmail}
                placeholder="Email"
                placeholderTextColor={Colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                value={loginPassword}
                onChangeText={setLoginPassword}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry
              />
              <View style={styles.inlineRow}>
                <Pressable
                  style={[styles.smallAction, rememberMe && styles.smallActionActive]}
                  onPress={() => setRememberMe(previous => !previous)}>
                  <Text style={rememberMe ? styles.smallActionTextActive : styles.smallActionText}>
                    {rememberMe ? 'Trust device' : 'Remember me'}
                  </Text>
                </Pressable>
                <Pressable style={styles.smallAction} onPress={() => setFlow('recovery')}>
                  <Text style={styles.smallActionText}>Forgot password</Text>
                </Pressable>
              </View>
              <Pressable style={[styles.primaryButton, styles.authButton]} onPress={runLogin}>
                <Text style={styles.primaryButtonText}>Sign in</Text>
              </Pressable>
              <Text style={styles.note}>{loginStatus}</Text>
              <View style={styles.providerRow}>
                <ProviderButton label="Google" tone={Colors.primary} onPress={() => setSocialStatus('Google sign-in handshake started.')} />
                <ProviderButton label="Apple" tone={Colors.textPrimary} onPress={() => setSocialStatus('Apple sign-in sheet opened.')} />
                <ProviderButton label="Microsoft" tone={Colors.secondary} onPress={() => setSocialStatus('Microsoft provider selected.')} />
              </View>
              <Text style={styles.note}>{socialStatus}</Text>
            </View>
          ) : null}

          {flow === 'signup' ? (
            <View style={styles.formBlock}>
              <Text style={styles.cardTitle}>Signup & Validation</Text>
              <Text style={styles.cardSubtitle}>New account onboarding with inline validation and password confirmation.</Text>
              <TextInput
                style={styles.input}
                value={signupName}
                onChangeText={setSignupName}
                placeholder="Display name"
                placeholderTextColor={Colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                value={signupEmail}
                onChangeText={setSignupEmail}
                placeholder="Email"
                placeholderTextColor={Colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                value={signupPassword}
                onChangeText={setSignupPassword}
                placeholder="Password"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                value={signupConfirm}
                onChangeText={setSignupConfirm}
                placeholder="Confirm password"
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry
              />
              <Pressable style={[styles.primaryButton, styles.authButton]} onPress={runSignup}>
                <Text style={styles.primaryButtonText}>Create account</Text>
              </Pressable>
              <Text style={styles.note}>{signupStatus}</Text>
            </View>
          ) : null}

          {flow === 'recovery' ? (
            <View style={styles.formBlock}>
              <Text style={styles.cardTitle}>Forgot Password Flow</Text>
              <Text style={styles.cardSubtitle}>Request a reset link and hand off into recovery email.</Text>
              <TextInput
                style={styles.input}
                value={recoveryEmail}
                onChangeText={setRecoveryEmail}
                placeholder="Recovery email"
                placeholderTextColor={Colors.textSecondary}
              />
              <Pressable style={[styles.primaryButton, styles.authButton]} onPress={runRecovery}>
                <Text style={styles.primaryButtonText}>Send reset link</Text>
              </Pressable>
              <Text style={styles.note}>{recoveryStatus}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.grid}>
          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>Biometric + Lock Screen</Text>
            <Text style={styles.cardSubtitle}>Fingerprint/face preview with PIN and pattern fallback.</Text>
            <Pressable style={[styles.primaryButton, styles.authButton]} onPress={runBiometric}>
              <Text style={styles.primaryButtonText}>Run biometric auth</Text>
            </Pressable>
            <Text style={styles.note}>{biometricStatus}</Text>

            <View style={styles.wrap}>
              {(['pin', 'pattern'] as GateMode[]).map(mode => (
                <Pressable
                  key={mode}
                  style={[styles.smallAction, gateMode === mode && styles.smallActionActive]}
                  onPress={() => setGateMode(mode)}>
                  <Text style={gateMode === mode ? styles.smallActionTextActive : styles.smallActionText}>
                    {mode}
                  </Text>
                </Pressable>
              ))}
            </View>

            {gateMode === 'pin' ? (
              <View style={styles.pinBlock}>
                <View style={styles.pinDots}>
                  {Array.from({length: 4}, (_, index) => (
                    <View key={index} style={[styles.pinDot, index < pinCode.length && styles.pinDotActive]} />
                  ))}
                </View>
                <View style={styles.keypad}>
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(digit => (
                    <Pressable key={digit} style={styles.keyButton} onPress={() => pushPinDigit(digit)}>
                      <Text style={styles.keyButtonText}>{digit}</Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable style={styles.smallAction} onPress={() => { setPinCode(''); setPinStatus('PIN code 2580 unlocks the preview.'); }}>
                  <Text style={styles.smallActionText}>Clear PIN</Text>
                </Pressable>
                <Text style={styles.note}>{pinStatus}</Text>
              </View>
            ) : (
              <View style={styles.patternBlock}>
                <View style={styles.patternGrid}>
                  {Array.from({length: 9}, (_, index) => {
                    const node = index + 1;
                    const active = patternSequence.includes(node);
                    return (
                      <Pressable
                        key={node}
                        style={[styles.patternNode, active && styles.patternNodeActive]}
                        onPress={() => pushPatternNode(node)}>
                        <Text style={active ? styles.patternNodeTextActive : styles.patternNodeText}>{node}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Pressable style={styles.smallAction} onPress={() => { setPatternSequence([]); setPatternStatus('Pattern 1-4-7-8-9 unlocks the preview.'); }}>
                  <Text style={styles.smallActionText}>Reset pattern</Text>
                </Pressable>
                <Text style={styles.note}>{patternStatus}</Text>
              </View>
            )}
          </View>

          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>Two-Factor Challenge</Text>
            <Text style={styles.cardSubtitle}>Method switcher, OTP cells and verification feedback.</Text>
            <View style={styles.wrap}>
              {(['sms', 'app', 'email'] as TwoFactorMethod[]).map(method => (
                <Pressable
                  key={method}
                  style={[styles.smallAction, twoFactorMethod === method && styles.smallActionActive]}
                  onPress={() => setTwoFactorMethod(method)}>
                  <Text style={twoFactorMethod === method ? styles.smallActionTextActive : styles.smallActionText}>
                    {method}
                  </Text>
                </Pressable>
              ))}
            </View>
            <OtpCells value={otp} />
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={value => setOtp(value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="number-pad"
            />
            <View style={styles.inlineRow}>
              <Pressable style={[styles.primaryButton, styles.inlineButton]} onPress={() => setTwoFactorStatus(`Code sent via ${twoFactorMethod.toUpperCase()}.`)}>
                <Text style={styles.primaryButtonText}>Send code</Text>
              </Pressable>
              <Pressable style={[styles.primaryButton, styles.inlineButton]} onPress={verifyOtp}>
                <Text style={styles.primaryButtonText}>Verify</Text>
              </Pressable>
            </View>
            <Text style={styles.note}>{twoFactorStatus}</Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  hero: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: Colors.primary,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  formBlock: {
    gap: Spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  inlineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  smallAction: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  smallActionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  smallActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  smallActionTextActive: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.bg,
  },
  primaryButton: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButton: {
    alignSelf: 'flex-start',
  },
  inlineButton: {
    flex: 1,
    minWidth: 140,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.bg,
  },
  providerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  providerButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    backgroundColor: Colors.surface,
  },
  providerText: {
    fontSize: 12,
    fontWeight: '800',
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  pinBlock: {
    gap: Spacing.md,
  },
  pinDots: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignSelf: 'center',
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pinDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  keyButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  patternBlock: {
    gap: Spacing.md,
  },
  patternGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    maxWidth: 196,
  },
  patternNode: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternNodeActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  patternNodeText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  patternNodeTextActive: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.bg,
  },
  otpRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  otpCell: {
    width: 42,
    height: 52,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpDigit: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
});
