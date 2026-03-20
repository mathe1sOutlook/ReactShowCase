import React from 'react';
import Svg, {Circle, Ellipse, Line, Path, Polyline, Rect} from 'react-native-svg';

export type IconName =
  | 'home'
  | 'grid'
  | 'info'
  | 'layout'
  | 'list'
  | 'navigation'
  | 'spark'
  | 'canvas'
  | 'cube'
  | 'chart'
  | 'vector'
  | 'table'
  | 'camera'
  | 'audio'
  | 'video'
  | 'file'
  | 'device'
  | 'browser'
  | 'network'
  | 'storage'
  | 'map'
  | 'lock'
  | 'theme'
  | 'code'
  | 'tools'
  | 'particles'
  | 'palette'
  | 'bolt'
  | 'widgets'
  | 'window'
  | 'search'
  | 'close'
  | 'empty'
  | 'error'
  | 'retry'
  | 'bridge'
  | 'external'
  | 'check';

type IconSymbolProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export default function IconSymbol({
  name,
  size = 20,
  color = '#fff',
  strokeWidth = 1.9,
}: IconSymbolProps) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  const glyph = (() => {
    switch (name) {
      case 'home':
        return (
          <>
            <Path {...common} d="M3.5 10.8L12 4l8.5 6.8" />
            <Path {...common} d="M5.5 10.2V20h13V10.2" />
            <Path {...common} d="M10 20v-5h4v5" />
          </>
        );
      case 'grid':
        return (
          <>
            <Rect {...common} x="4" y="4" width="6.5" height="6.5" rx="1.4" />
            <Rect {...common} x="13.5" y="4" width="6.5" height="6.5" rx="1.4" />
            <Rect {...common} x="4" y="13.5" width="6.5" height="6.5" rx="1.4" />
            <Rect {...common} x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" />
          </>
        );
      case 'info':
        return (
          <>
            <Circle {...common} cx="12" cy="12" r="8.5" />
            <Line {...common} x1="12" y1="10.5" x2="12" y2="16.5" />
            <Circle cx="12" cy="7.2" r="1" fill={color} />
          </>
        );
      case 'layout':
        return (
          <>
            <Rect {...common} x="4" y="5" width="16" height="14" rx="2.2" />
            <Line {...common} x1="9" y1="5" x2="9" y2="19" />
            <Line {...common} x1="9" y1="10.5" x2="20" y2="10.5" />
          </>
        );
      case 'list':
        return (
          <>
            <Circle cx="6" cy="7" r="1.1" fill={color} />
            <Circle cx="6" cy="12" r="1.1" fill={color} />
            <Circle cx="6" cy="17" r="1.1" fill={color} />
            <Line {...common} x1="9.2" y1="7" x2="19" y2="7" />
            <Line {...common} x1="9.2" y1="12" x2="19" y2="12" />
            <Line {...common} x1="9.2" y1="17" x2="19" y2="17" />
          </>
        );
      case 'navigation':
        return (
          <>
            <Circle {...common} cx="12" cy="12" r="8.5" />
            <Path {...common} d="M9 15l6-6-1.6 5.3L9 15z" />
          </>
        );
      case 'spark':
        return <Path {...common} d="M12 4l1.9 4.9L19 10.8l-4.2 2.7L16 19l-4-2.8L8 19l1.2-5.5L5 10.8l5.1-1.9L12 4z" />;
      case 'canvas':
        return (
          <>
            <Rect {...common} x="4" y="5" width="16" height="14" rx="2.2" />
            <Path {...common} d="M8 15l3-3 2.5 2.5L17 11l3 4" />
          </>
        );
      case 'cube':
        return (
          <>
            <Path {...common} d="M12 4l7 4-7 4-7-4 7-4z" />
            <Path {...common} d="M5 8v8l7 4 7-4V8" />
            <Line {...common} x1="12" y1="12" x2="12" y2="20" />
          </>
        );
      case 'chart':
        return (
          <>
            <Line {...common} x1="5" y1="19" x2="19" y2="19" />
            <Rect {...common} x="6" y="11" width="2.8" height="8" rx="1" />
            <Rect {...common} x="10.6" y="8" width="2.8" height="11" rx="1" />
            <Rect {...common} x="15.2" y="5" width="2.8" height="14" rx="1" />
          </>
        );
      case 'vector':
        return (
          <>
            <Circle {...common} cx="6.5" cy="8" r="2" />
            <Circle {...common} cx="17.5" cy="6.5" r="2" />
            <Circle {...common} cx="15.5" cy="17" r="2" />
            <Path {...common} d="M8.5 8l7-1.5M8 9.3l6.2 6.2" />
          </>
        );
      case 'table':
        return (
          <>
            <Rect {...common} x="4" y="5" width="16" height="14" rx="2" />
            <Line {...common} x1="4" y1="10" x2="20" y2="10" />
            <Line {...common} x1="4" y1="14.5" x2="20" y2="14.5" />
            <Line {...common} x1="10" y1="5" x2="10" y2="19" />
          </>
        );
      case 'camera':
        return (
          <>
            <Path {...common} d="M5 8h3l1.5-2h5L16 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z" />
            <Circle {...common} cx="12" cy="13" r="3.5" />
          </>
        );
      case 'audio':
        return (
          <>
            <Path {...common} d="M12 5a2.5 2.5 0 0 1 2.5 2.5v5A2.5 2.5 0 0 1 12 15a2.5 2.5 0 0 1-2.5-2.5v-5A2.5 2.5 0 0 1 12 5z" />
            <Path {...common} d="M7.5 11.5a4.5 4.5 0 0 0 9 0" />
            <Line {...common} x1="12" y1="15" x2="12" y2="19" />
            <Line {...common} x1="9.5" y1="19" x2="14.5" y2="19" />
          </>
        );
      case 'video':
        return (
          <>
            <Rect {...common} x="4" y="6" width="11" height="12" rx="2" />
            <Path {...common} d="M15 10l5-3v10l-5-3z" />
          </>
        );
      case 'file':
        return (
          <>
            <Path {...common} d="M7 4h7l4 4v12H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
            <Path {...common} d="M14 4v4h4" />
          </>
        );
      case 'device':
        return (
          <>
            <Rect {...common} x="7.5" y="3.5" width="9" height="17" rx="2.3" />
            <Line {...common} x1="10" y1="6.5" x2="14" y2="6.5" />
            <Circle cx="12" cy="17.2" r="0.9" fill={color} />
          </>
        );
      case 'browser':
        return (
          <>
            <Rect {...common} x="3.5" y="5" width="17" height="14" rx="2.4" />
            <Line {...common} x1="3.5" y1="9" x2="20.5" y2="9" />
            <Circle cx="7" cy="7" r="0.8" fill={color} />
            <Circle cx="10" cy="7" r="0.8" fill={color} />
            <Circle cx="13" cy="7" r="0.8" fill={color} />
          </>
        );
      case 'network':
        return (
          <>
            <Circle {...common} cx="6" cy="12" r="2" />
            <Circle {...common} cx="18" cy="7" r="2" />
            <Circle {...common} cx="18" cy="17" r="2" />
            <Line {...common} x1="8" y1="11.2" x2="16" y2="7.8" />
            <Line {...common} x1="8" y1="12.8" x2="16" y2="16.2" />
          </>
        );
      case 'storage':
        return (
          <>
            <Ellipse {...common} cx="12" cy="6.5" rx="6.5" ry="2.7" />
            <Path {...common} d="M5.5 6.5v4.8c0 1.5 2.9 2.7 6.5 2.7s6.5-1.2 6.5-2.7V6.5" />
            <Path {...common} d="M5.5 11.3v4.8c0 1.5 2.9 2.7 6.5 2.7s6.5-1.2 6.5-2.7v-4.8" />
          </>
        );
      case 'map':
        return (
          <>
            <Path {...common} d="M12 20s5-5.2 5-9a5 5 0 1 0-10 0c0 3.8 5 9 5 9z" />
            <Circle {...common} cx="12" cy="11" r="1.8" />
          </>
        );
      case 'lock':
        return (
          <>
            <Rect {...common} x="5.5" y="10.5" width="13" height="9" rx="2" />
            <Path {...common} d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
          </>
        );
      case 'theme':
        return <Path {...common} d="M12.5 4.5a7.5 7.5 0 1 0 7 10.5A8.5 8.5 0 0 1 12.5 4.5z" />;
      case 'code':
        return (
          <>
            <Rect {...common} x="4" y="4" width="6" height="6" rx="1.2" />
            <Rect {...common} x="14" y="4" width="6" height="6" rx="1.2" />
            <Rect {...common} x="4" y="14" width="6" height="6" rx="1.2" />
            <Line {...common} x1="15" y1="15" x2="20" y2="15" />
            <Line {...common} x1="15" y1="18" x2="18" y2="18" />
          </>
        );
      case 'tools':
        return (
          <>
            <Path {...common} d="M14.5 5.5a3.4 3.4 0 0 0 3.8 4.6l-7.8 7.8a2 2 0 0 1-2.8-2.8l7.8-7.8a3.4 3.4 0 0 0-1-4.6z" />
            <Circle {...common} cx="7" cy="17" r="1" />
          </>
        );
      case 'particles':
        return (
          <>
            <Circle cx="7" cy="8" r="1.5" fill={color} />
            <Circle cx="16.5" cy="7" r="1.2" fill={color} />
            <Circle cx="11.5" cy="12.5" r="1.4" fill={color} />
            <Circle cx="7.5" cy="17" r="1.2" fill={color} />
            <Circle cx="17" cy="16.5" r="1.6" fill={color} />
            <Line {...common} x1="8.2" y1="9" x2="10.5" y2="11.3" />
            <Line {...common} x1="12.9" y1="12.2" x2="15.8" y2="8.1" />
            <Line {...common} x1="12.2" y1="13.8" x2="16" y2="15.8" />
          </>
        );
      case 'palette':
        return (
          <>
            <Path {...common} d="M12 4.2c4.7 0 8.5 3.1 8.5 7 0 3-2.2 5-5.2 5H14a1.5 1.5 0 0 0 0 3h.3c-1 .4-2 .6-3.3.6-4.6 0-7.5-2.7-7.5-6.7 0-5 4-8.9 8.5-8.9z" />
            <Circle cx="7.8" cy="10.3" r="0.9" fill={color} />
            <Circle cx="10.5" cy="7.8" r="0.9" fill={color} />
            <Circle cx="14.5" cy="8" r="0.9" fill={color} />
            <Circle cx="16.4" cy="11.5" r="0.9" fill={color} />
          </>
        );
      case 'bolt':
        return <Path {...common} d="M13.2 3L6.8 13h4l-1 8L17.2 11h-4L13.2 3z" />;
      case 'widgets':
        return (
          <>
            <Rect {...common} x="4" y="4" width="8" height="7" rx="1.4" />
            <Rect {...common} x="13.5" y="4" width="6.5" height="16" rx="1.4" />
            <Rect {...common} x="4" y="12.5" width="8" height="7.5" rx="1.4" />
          </>
        );
      case 'window':
        return (
          <>
            <Rect {...common} x="3.5" y="5" width="17" height="14" rx="2.4" />
            <Line {...common} x1="3.5" y1="9" x2="20.5" y2="9" />
            <Line {...common} x1="9" y1="9" x2="9" y2="19" />
          </>
        );
      case 'search':
        return (
          <>
            <Circle {...common} cx="10.5" cy="10.5" r="5.5" />
            <Line {...common} x1="15" y1="15" x2="19.5" y2="19.5" />
          </>
        );
      case 'close':
        return (
          <>
            <Line {...common} x1="6" y1="6" x2="18" y2="18" />
            <Line {...common} x1="18" y1="6" x2="6" y2="18" />
          </>
        );
      case 'empty':
        return (
          <>
            <Path {...common} d="M5 8h14l-1 10a2 2 0 0 1-2 1.8H8a2 2 0 0 1-2-1.8L5 8z" />
            <Path {...common} d="M9 8V6.7A2.7 2.7 0 0 1 11.7 4h.6A2.7 2.7 0 0 1 15 6.7V8" />
          </>
        );
      case 'error':
        return (
          <>
            <Path {...common} d="M12 4.5l8 14H4l8-14z" />
            <Line {...common} x1="12" y1="9" x2="12" y2="13.5" />
            <Circle cx="12" cy="16.8" r="1" fill={color} />
          </>
        );
      case 'retry':
        return (
          <>
            <Path {...common} d="M19 8a7.5 7.5 0 0 0-12.8-2" />
            <Polyline {...common} points="7.2 4.5 6.2 7.8 9.5 8.7" />
            <Path {...common} d="M5 16a7.5 7.5 0 0 0 12.8 2" />
            <Polyline {...common} points="16.8 19.5 17.8 16.2 14.5 15.3" />
          </>
        );
      case 'bridge':
        return (
          <>
            <Rect {...common} x="4" y="7" width="6" height="10" rx="1.5" />
            <Rect {...common} x="14" y="7" width="6" height="10" rx="1.5" />
            <Line {...common} x1="10" y1="10" x2="14" y2="10" />
            <Line {...common} x1="10" y1="14" x2="14" y2="14" />
          </>
        );
      case 'external':
        return (
          <>
            <Path {...common} d="M13 5h6v6" />
            <Path {...common} d="M11 13l8-8" />
            <Path {...common} d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" />
          </>
        );
      case 'check':
        return <Polyline {...common} points="5.5 12.5 10 17 18.5 8.5" />;
      default:
        return <Circle {...common} cx="12" cy="12" r="8" />;
    }
  })();

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {glyph}
    </Svg>
  );
}
