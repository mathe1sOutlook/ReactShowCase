import React, {useEffect, useRef, useState} from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import WebView from 'react-native-webview';
import type {
  WebViewMessageEvent,
  WebViewNavigation,
} from 'react-native-webview';
import type {
  WebViewProgressEvent,
  WebViewSource,
} from 'react-native-webview/lib/WebViewTypes';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing} from '../theme';

type BrowserPreset = {
  label: string;
  url: string;
  tone: string;
};

type LogItem = {
  id: string;
  title: string;
  detail: string;
  tone: string;
};

type LocalPageKey = 'home' | 'bridge' | 'links';

const LOCAL_URLS: Record<LocalPageKey, string> = {
  home: 'https://showcase.cfd.dev/browser/home',
  bridge: 'https://showcase.cfd.dev/browser/bridge',
  links: 'https://showcase.cfd.dev/browser/links',
};

const PRESETS: BrowserPreset[] = [
  {label: 'Home', url: LOCAL_URLS.home, tone: Colors.primary},
  {label: 'Bridge', url: LOCAL_URLS.bridge, tone: Colors.secondary},
  {label: 'Special Links', url: LOCAL_URLS.links, tone: Colors.warning},
  {label: 'React Native', url: 'https://reactnative.dev', tone: Colors.success},
];

const LOCAL_ALIAS: Record<string, string> = {
  home: LOCAL_URLS.home,
  bridge: LOCAL_URLS.bridge,
  links: LOCAL_URLS.links,
  'showcase://browser/home': LOCAL_URLS.home,
  'showcase://browser/bridge': LOCAL_URLS.bridge,
  'showcase://browser/links': LOCAL_URLS.links,
};

function stamp() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function makeLog(title: string, detail: string, tone: string): LogItem {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    detail,
    tone,
  };
}

function getLocalPage(url: string): LocalPageKey | null {
  if (url.includes('/bridge')) {
    return 'bridge';
  }
  if (url.includes('/links')) {
    return 'links';
  }
  if (url.includes('/home')) {
    return 'home';
  }
  return null;
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return LOCAL_URLS.home;
  }

  const alias = LOCAL_ALIAS[trimmed.toLowerCase()];
  if (alias) {
    return alias;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function buildExternalUrl(url: string) {
  const localPage = getLocalPage(url);
  if (localPage === 'bridge') {
    return 'https://github.com/react-native-webview/react-native-webview';
  }
  if (localPage === 'links') {
    return 'https://reactnative.dev/docs/linking';
  }
  return localPage ? 'https://reactnative.dev' : url;
}

function buildSpecialFallback(url: string) {
  if (url.startsWith('tel:')) {
    return 'https://showcase.cfd.dev/contact';
  }
  if (url.startsWith('mailto:')) {
    return 'https://showcase.cfd.dev/support';
  }
  if (url.startsWith('maps:')) {
    const query = encodeURIComponent('Showcase Labs, Sao Paulo');
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
  return buildExternalUrl(url);
}

function buildLocalHtml(url: string) {
  const page = getLocalPage(url) ?? 'home';
  const pageMeta = {
    home: {
      title: 'Browser lab',
      subtitle: 'Custom URLs, browser navigation and controlled WebView rendering.',
      accent: '#65f2ff',
      content: `
        <div class="grid">
          <article class="panel">
            <span class="eyebrow">Custom URL</span>
            <h2>Controlled navigation</h2>
            <p>Use the native toolbar to load presets, edit the address bar and move through browser history.</p>
          </article>
          <article class="panel">
            <span class="eyebrow">Injection</span>
            <h2>JavaScript hooks</h2>
            <p>Native actions can recolor the page, stamp diagnostics and post events back into React Native.</p>
          </article>
        </div>
      `,
    },
    bridge: {
      title: 'Bridge channel',
      subtitle: 'Two-way communication between WebView and React Native.',
      accent: '#ff74dd',
      content: `
        <div class="grid">
          <article class="panel">
            <span class="eyebrow">Web to Native</span>
            <h2>Message bridge</h2>
            <p>Tap one of the actions below to push a JSON payload to React Native.</p>
            <div class="button-row">
              <button data-bridge="web-ping" data-payload="Bridge ping from WebView">Send ping</button>
              <button data-bridge="web-metrics" data-payload="fps=59 cache=warm">Send metrics</button>
              <button data-bridge="web-refresh" data-payload="reload requested">Request refresh</button>
            </div>
          </article>
          <article class="panel">
            <span class="eyebrow">Native to Web</span>
            <h2>Inbox</h2>
            <p id="native-inbox">Waiting for a native message...</p>
            <p id="bridge-status">Waiting for a JavaScript injection...</p>
          </article>
        </div>
      `,
    },
    links: {
      title: 'Link handling',
      subtitle: 'Handle tel:, mailto: and maps: routes outside the WebView.',
      accent: '#ffe95f',
      content: `
        <div class="grid">
          <article class="panel">
            <span class="eyebrow">External handlers</span>
            <h2>Special schemes</h2>
            <div class="button-row">
              <a class="chip" href="tel:+5511999999999">tel:+55 11 99999-9999</a>
              <a class="chip" href="mailto:team@showcase.dev">mailto:team@showcase.dev</a>
              <a class="chip" href="maps:showcase-labs">maps:showcase-labs</a>
            </div>
          </article>
          <article class="panel">
            <span class="eyebrow">Open external</span>
            <h2>Browser handoff</h2>
            <p>The native toolbar can open the current page in the system browser when needed.</p>
          </article>
        </div>
      `,
    },
  }[page];

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <title>${pageMeta.title}</title>
    <style>
      :root {
        --bg: #07111f;
        --surface: rgba(13, 30, 48, 0.9);
        --surface-alt: rgba(18, 39, 61, 0.82);
        --text: #ecf7ff;
        --muted: #9bb7cc;
        --accent: ${pageMeta.accent};
        --border: rgba(135, 185, 222, 0.18);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at top right, rgba(101, 242, 255, 0.22), transparent 28%),
          linear-gradient(180deg, #06111f 0%, #0b1628 100%);
        color: var(--text);
        padding: 24px;
      }
      .shell {
        max-width: 980px;
        margin: 0 auto;
        border: 1px solid var(--border);
        border-radius: 28px;
        overflow: hidden;
        background: rgba(6, 16, 27, 0.84);
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.28);
      }
      header {
        padding: 24px;
        border-bottom: 1px solid var(--border);
        background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0));
      }
      .eyebrow {
        display: inline-block;
        font-size: 11px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--accent);
        margin-bottom: 8px;
      }
      h1, h2 { margin: 0; }
      h1 { font-size: 30px; }
      h2 { font-size: 18px; margin-bottom: 10px; }
      p {
        margin: 0;
        color: var(--muted);
        line-height: 1.6;
        font-size: 14px;
      }
      nav {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        padding: 20px 24px 0;
      }
      nav a, .chip, button {
        text-decoration: none;
        color: var(--text);
        border: 1px solid var(--border);
        background: var(--surface-alt);
        padding: 10px 14px;
        border-radius: 999px;
        font-size: 13px;
        cursor: pointer;
      }
      .grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      }
      .panel {
        border: 1px solid var(--border);
        border-radius: 22px;
        background: var(--surface);
        padding: 20px;
      }
      .content {
        padding: 24px;
        display: grid;
        gap: 18px;
      }
      .button-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 16px;
      }
      #native-inbox, #bridge-status {
        margin-top: 14px;
        padding: 14px 16px;
        border-radius: 18px;
        border: 1px dashed var(--border);
        background: rgba(255,255,255,0.03);
      }
      footer {
        padding: 20px 24px 24px;
        color: var(--muted);
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <header>
        <span class="eyebrow">CFD WebView</span>
        <h1>${pageMeta.title}</h1>
        <p>${pageMeta.subtitle}</p>
      </header>
      <nav>
        <a href="${LOCAL_URLS.home}">Home</a>
        <a href="${LOCAL_URLS.bridge}">Bridge</a>
        <a href="${LOCAL_URLS.links}">Special links</a>
        <a href="https://reactnative.dev/docs/linking">Docs</a>
      </nav>
      <main class="content">
        ${pageMeta.content}
      </main>
      <footer>Current URL: ${url}</footer>
    </div>
    <script>
      (function () {
        function emit(type, payload) {
          if (!window.ReactNativeWebView) {
            return;
          }
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              type: type,
              payload: payload,
              url: window.location.href,
              stamp: new Date().toISOString()
            })
          );
        }

        function handleNativeMessage(raw) {
          var text = raw;
          try {
            var parsed = JSON.parse(raw);
            text = parsed.type ? parsed.type + ': ' + parsed.payload : raw;
          } catch (error) {}

          var inbox = document.getElementById('native-inbox');
          var status = document.getElementById('bridge-status');
          if (inbox) {
            inbox.textContent = text;
          }
          if (status) {
            status.textContent = 'Native event received at ' + new Date().toLocaleTimeString();
          }
          emit('native-ack', text);
        }

        window.addEventListener('message', function (event) {
          handleNativeMessage(event.data);
        });

        document.addEventListener('message', function (event) {
          handleNativeMessage(event.data);
        });

        Array.prototype.forEach.call(document.querySelectorAll('[data-bridge]'), function (button) {
          button.addEventListener('click', function () {
            emit(button.getAttribute('data-bridge'), button.getAttribute('data-payload') || button.textContent || 'action');
          });
        });

        emit('page-ready', '${page}');
      })();
    </script>
  </body>
</html>
  `;
}

export default function WebScreen() {
  const {width} = useWindowDimensions();
  const cardWidth = width >= 1080 ? (width - Spacing.lg * 2 - Spacing.md) / 2 : width - Spacing.lg * 2;
  const browserHeight = width >= 1200 ? 560 : width >= 760 ? 500 : 420;
  const webRef = useRef<WebView>(null);
  const [history, setHistory] = useState<string[]>([LOCAL_URLS.home]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const currentUrl = history[historyIndex] ?? LOCAL_URLS.home;
  const [addressInput, setAddressInput] = useState(currentUrl);
  const [progress, setProgress] = useState(0.14);
  const [loading, setLoading] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [lastInjected, setLastInjected] = useState('JavaScript bridge ready.');
  const [lastRouteAction, setLastRouteAction] = useState('No external handoff yet.');
  const [requestLog, setRequestLog] = useState<LogItem[]>([
    makeLog('Browser ready', 'Controlled WebView mounted with local home page.', Colors.primary),
  ]);
  const [bridgeLog, setBridgeLog] = useState<LogItem[]>([
    makeLog('Bridge ready', 'WebView postMessage channel is listening.', Colors.secondary),
  ]);

  useEffect(() => {
    setAddressInput(currentUrl);
  }, [currentUrl]);

  const appendRequest = (title: string, detail: string, tone: string) => {
    setRequestLog(previous => [makeLog(title, detail, tone), ...previous].slice(0, 6));
  };

  const appendBridge = (title: string, detail: string, tone: string) => {
    setBridgeLog(previous => [makeLog(title, detail, tone), ...previous].slice(0, 6));
  };

  const navigateTo = (rawValue: string) => {
    const nextUrl = normalizeUrl(rawValue);

    if (/^(tel:|mailto:|maps:)/i.test(nextUrl)) {
      void handleSpecialLink(nextUrl, 'Address bar');
      return;
    }

    setHistory(previous => {
      const base = previous.slice(0, historyIndex + 1);
      if (base[base.length - 1] === nextUrl) {
        return base;
      }
      return [...base, nextUrl];
    });
    setHistoryIndex(previous => previous + 1);
    setProgress(0.12);
    appendRequest('Navigate', nextUrl, Colors.primary);
  };

  const goBack = () => {
    if (historyIndex === 0) {
      return;
    }
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    appendRequest('Back', history[nextIndex] ?? currentUrl, Colors.warning);
  };

  const goForward = () => {
    if (historyIndex >= history.length - 1) {
      return;
    }
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    appendRequest('Forward', history[nextIndex] ?? currentUrl, Colors.success);
  };

  const refresh = () => {
    setReloadNonce(previous => previous + 1);
    setProgress(0.16);
    appendRequest('Refresh', currentUrl, Colors.accent);
  };

  const openExternal = async () => {
    const target = buildExternalUrl(currentUrl);
    try {
      await Linking.openURL(target);
      setLastRouteAction(`Opened external browser: ${target}`);
      appendRequest('External browser', target, Colors.secondary);
    } catch {
      setLastRouteAction(`External browser unavailable for ${target}`);
      appendRequest('External fallback', target, Colors.error);
    }
  };

  const handleSpecialLink = async (url: string, source: string) => {
    try {
      await Linking.openURL(url);
      setLastRouteAction(`${source} opened ${url}`);
      appendRequest('Handled special link', `${source}: ${url}`, Colors.warning);
    } catch {
      const fallback = buildSpecialFallback(url);
      try {
        await Linking.openURL(fallback);
        setLastRouteAction(`${source} fallback opened ${fallback}`);
        appendRequest('Special link fallback', `${url} -> ${fallback}`, Colors.warning);
      } catch {
        setLastRouteAction(`${source} could not open ${url}`);
        appendRequest('Special link failed', url, Colors.error);
      }
    }
  };

  const postNativeMessage = () => {
    const message = JSON.stringify({
      type: 'native-bridge',
      payload: `Native toolbar ping at ${stamp()}`,
    });
    webRef.current?.postMessage(message);
    appendBridge('Native -> Web', message, Colors.secondary);
  };

  const injectScript = () => {
    const script = `
      (function() {
        var status = document.getElementById('bridge-status');
        if (status) {
          status.textContent = 'Injected by React Native at ${stamp()}';
          status.style.borderColor = '${Colors.primary}';
        }
        document.body.style.boxShadow = 'inset 0 0 0 2px ${Colors.primary}';
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'native-injected',
            payload: 'Accent sync applied'
          }));
        }
        true;
      })();
    `;
    webRef.current?.injectJavaScript(script);
    setLastInjected('Accent sync injected into the current page.');
    appendBridge('Native JS', 'Injected accent sync into the WebView DOM.', Colors.primary);
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    const raw = event.nativeEvent.data;
    let detail = raw;
    try {
      const parsed = JSON.parse(raw) as {type?: string; payload?: string; url?: string};
      detail = `${parsed.type ?? 'message'} - ${parsed.payload ?? parsed.url ?? 'no payload'}`;
    } catch {}
    appendBridge('Web -> Native', detail, Colors.secondary);
  };

  const handleShouldStart = (request: WebViewNavigation) => {
    if (!request.url || request.url === currentUrl || request.url === 'about:blank') {
      return true;
    }

    if (/^(tel:|mailto:|maps:)/i.test(request.url)) {
      void handleSpecialLink(request.url, 'WebView');
      return false;
    }

    if (request.url.startsWith('https://showcase.cfd.dev/browser/')) {
      navigateTo(request.url);
      return false;
    }

    if (request.navigationType === 'click') {
      navigateTo(request.url);
      return false;
    }

    return true;
  };

  const handleProgress = (event: WebViewProgressEvent) => {
    setProgress(Math.max(0.08, event.nativeEvent.progress));
  };

  const handleLoadStart = () => {
    setLoading(true);
    setProgress(previous => Math.max(0.12, previous));
  };

  const handleLoadEnd = () => {
    setLoading(false);
    setProgress(1);
  };

  let source: WebViewSource;
  const localPage = getLocalPage(currentUrl);
  if (localPage) {
    source = {html: buildLocalHtml(currentUrl), baseUrl: currentUrl};
  } else {
    source = {uri: currentUrl};
  }

  return (
    <ScreenContainer>
      <View style={styles.root}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PHASE 7.1</Text>
          <Text style={styles.title}>WebView & Browser</Text>
          <Text style={styles.body}>
            A real browser lab with controlled navigation, JavaScript injection, bridge messaging
            and special link handling.
          </Text>
          <View style={styles.pills}>
            <View style={styles.pill}><Text style={styles.pillText}>7 demos</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>{history.length} history entries</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>{localPage ? 'Local page' : 'Remote page'}</Text></View>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Browser Controls</Text>
          <Text style={styles.sectionText}>
            Custom URL entry, browser history, external handoff and deterministic local pages.
          </Text>
        </View>
        <View style={styles.grid}>
          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>Presets</Text>
            <Text style={styles.cardSubtitle}>Jump between local browser pages and a remote documentation target.</Text>
            <View style={styles.wrap}>
              {PRESETS.map(preset => (
                <Pressable
                  key={preset.url}
                  style={[styles.smallAction, {borderColor: preset.tone + '44'}]}
                  onPress={() => navigateTo(preset.url)}>
                  <Text style={[styles.smallActionText, {color: preset.tone}]}>{preset.label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.addressRow}>
              <TextInput
                style={styles.input}
                value={addressInput}
                onChangeText={setAddressInput}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Enter a URL or alias"
                placeholderTextColor={Colors.textSecondary}
                onSubmitEditing={() => navigateTo(addressInput)}
              />
              <Pressable style={[styles.smallAction, styles.smallActionActive]} onPress={() => navigateTo(addressInput)}>
                <Text style={styles.smallActionTextActive}>Go</Text>
              </Pressable>
            </View>
            <Text style={styles.note}>Aliases: home, bridge, links, showcase://browser/home</Text>
          </View>

          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>Native Actions</Text>
            <Text style={styles.cardSubtitle}>Toolbar navigation, JavaScript injection and bridge messaging.</Text>
            <View style={styles.wrap}>
              <Pressable
                style={[styles.smallAction, historyIndex === 0 && styles.disabledAction]}
                onPress={goBack}>
                <Text style={styles.smallActionText}>Back</Text>
              </Pressable>
              <Pressable
                style={[styles.smallAction, historyIndex >= history.length - 1 && styles.disabledAction]}
                onPress={goForward}>
                <Text style={styles.smallActionText}>Forward</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={refresh}>
                <Text style={styles.smallActionText}>Refresh</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={injectScript}>
                <Text style={styles.smallActionText}>Inject JS</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={postNativeMessage}>
                <Text style={styles.smallActionText}>Bridge ping</Text>
              </Pressable>
              <Pressable style={styles.smallAction} onPress={() => void openExternal()}>
                <Text style={styles.smallActionText}>Open external</Text>
              </Pressable>
            </View>
            <Text style={styles.note}>{lastInjected}</Text>
            <Text style={styles.note}>{lastRouteAction}</Text>
          </View>
        </View>

        <View style={styles.browserCard}>
          <View style={styles.browserHeader}>
            <View>
              <Text style={styles.browserTitle}>Embedded browser</Text>
              <Text style={styles.browserUrl}>{currentUrl}</Text>
            </View>
            <View style={styles.browserBadge}>
              <Text style={styles.browserBadgeText}>{loading ? 'Loading' : 'Ready'}</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {width: `${Math.max(8, Math.round(progress * 100))}%`},
              ]}
            />
          </View>
          <View style={[styles.webViewWrap, {height: browserHeight}]}>
            <WebView
              key={`${currentUrl}-${reloadNonce}`}
              ref={webRef}
              source={source}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled
              onMessage={handleMessage}
              onShouldStartLoadWithRequest={handleShouldStart}
              onLoadProgress={handleProgress}
              onLoadStart={handleLoadStart}
              onLoadEnd={handleLoadEnd}
              setSupportMultipleWindows={false}
              style={styles.webView}
            />
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Bridge & Route Logs</Text>
          <Text style={styles.sectionText}>
            WebView postMessage events, navigation telemetry and special link handling.
          </Text>
        </View>
        <View style={styles.grid}>
          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>Bridge Log</Text>
            <Text style={styles.cardSubtitle}>Messages exchanged between native controls and the page.</Text>
            {bridgeLog.map(item => (
              <View key={item.id} style={styles.logRow}>
                <View style={[styles.logTone, {backgroundColor: item.tone}]} />
                <View style={styles.logCopy}>
                  <Text style={styles.logTitle}>{item.title}</Text>
                  <Text style={styles.logDetail}>{item.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.card, {width: cardWidth}]}>
            <Text style={styles.cardTitle}>Request Log</Text>
            <Text style={styles.cardSubtitle}>Address bar updates, navigation changes and external handlers.</Text>
            {requestLog.map(item => (
              <View key={item.id} style={styles.logRow}>
                <View style={[styles.logTone, {backgroundColor: item.tone}]} />
                <View style={styles.logCopy}>
                  <Text style={styles.logTitle}>{item.title}</Text>
                  <Text style={styles.logDetail}>{item.detail}</Text>
                </View>
              </View>
            ))}
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
  sectionHead: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
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
  disabledAction: {
    opacity: 0.45,
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
  addressRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  browserCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  browserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  browserTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  browserUrl: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  browserBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  browserBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  progressTrack: {
    height: 5,
    backgroundColor: Colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  webViewWrap: {
    backgroundColor: '#020816',
  },
  webView: {
    flex: 1,
    backgroundColor: '#020816',
  },
  logRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  logTone: {
    width: 10,
    alignSelf: 'stretch',
    borderRadius: Radius.full,
  },
  logCopy: {
    flex: 1,
    gap: 4,
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  logDetail: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
});
