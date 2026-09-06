import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Sparkle, X, PaperPlaneTilt, Compass, Lightning, Robot } from 'phosphor-react-native';
import { useTheme, typography, radii } from '../theme';
import { askCampusAI } from '../utils/geminiAI';
import type { EventItem } from '../data/events';
import { DIRECTORY } from '../data/directory';

type Message = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  events: EventItem[];
};

const PROMPT_CHIPS = [
  '🔥 What events are happening soon?',
  '💻 Find tech workshops or hackathons',
  '🎭 Any cultural auditions or fests?',
  '📍 Where is LH121 / Mittal Complex?',
  '🚑 IIT Delhi Hospital & Ambulance number',
];

export default function AICampusConcierge({ visible, onClose, events }: Props) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hey! I'm **Loop AI**, your IIT Delhi campus concierge. Ask me about upcoming club events, hackathons, hostel fests, or campus facilities!",
      timestamp: 'Just now',
    },
  ]);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      // scroll automatically handled by onContentSizeChange now
    }
  }, [visible, messages]);

  if (!visible) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await askCampusAI(textToSend, events, DIRECTORY);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I hit a snag answering that. Please try asking again in a moment!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close AI concierge"
        />

        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? 'rgba(20, 20, 26, 0.92)' : 'rgba(255, 255, 255, 0.94)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              maxWidth: isDesktop ? 620 : '100%',
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.aiIconBadge, { backgroundColor: colors.highlight }]}>
                <Sparkle size={18} color={colors.primary} weight="fill" />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.foreground }]}>Loop AI Concierge</Text>
                <Text style={[styles.headerSub, { color: colors.muted }]}>
                  Powered by Gemini · IIT Delhi Campus Intelligence
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: colors.highlight },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
            >
              <X size={18} color={colors.foreground} weight="bold" />
            </Pressable>
          </View>

          {/* Messages Scroll Area */}
          <ScrollView
            ref={scrollRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <View
                  key={m.id}
                  style={[
                    styles.messageBubble,
                    isUser
                      ? [styles.userBubble, { backgroundColor: colors.primary }]
                      : [styles.aiBubble, { backgroundColor: colors.background, borderColor: colors.border }],
                  ]}
                >
                  {!isUser && (
                    <View style={styles.aiLabel}>
                      <Robot size={14} color={colors.primary} weight="bold" />
                      <Text style={[styles.aiLabelText, { color: colors.primary }]}>Loop AI</Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.messageText,
                      { color: isUser ? colors.onPrimary : colors.foreground },
                    ]}
                  >
                    {m.text.split('\n').map((line, lineIdx, arr) => {
                      const isBullet = /^[*-]\s+/.test(line.trim());
                      const cleanLine = isBullet ? line.trim().replace(/^[*-]\s+/, '• ') : line;
                      const hasNext = lineIdx < arr.length - 1;

                      return (
                        <Text key={lineIdx}>
                          {cleanLine.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return (
                                <Text key={i} style={{ fontWeight: '700', color: isUser ? colors.onPrimary : colors.primary }}>
                                  {part.slice(2, -2)}
                                </Text>
                              );
                            }
                            return part;
                          })}
                          {hasNext ? '\n' : ''}
                        </Text>
                      );
                    })}
                  </Text>
                  <Text
                    style={[
                      styles.timestamp,
                      { color: isUser ? 'rgba(255,255,255,0.7)' : colors.muted },
                    ]}
                  >
                    {m.timestamp}
                  </Text>
                </View>
              );
            })}

            {loading && (
              <View style={[styles.loadingBubble, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.muted }]}>Thinking...</Text>
              </View>
            )}
          </ScrollView>

          {/* Preset Suggested Query Chips */}
          <View style={styles.chipsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
              {PROMPT_CHIPS.map((chip, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleSend(chip)}
                  accessibilityRole="button"
                  accessibilityLabel={`Ask question: ${chip}`}
                  style={({ pressed }) => [
                    styles.chip,
                    { backgroundColor: colors.highlight, borderColor: colors.border },
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                    pressed && { transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <Text style={[styles.chipText, { color: colors.primary }]}>{chip}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Input Bar */}
          <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            <TextInput
              placeholder="Ask anything about campus events, venues..."
              placeholderTextColor={colors.muted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => handleSend()}
              style={[styles.input, { color: colors.foreground }]}
            />
            <Pressable
              onPress={() => handleSend()}
              disabled={!input.trim() || loading}
              accessibilityRole="button"
              accessibilityLabel="Send question to AI concierge"
              style={({ pressed }) => [
                styles.sendBtn,
                {
                  backgroundColor: input.trim() ? colors.primary : colors.highlight,
                  opacity: input.trim() ? 1 : 0.5,
                },
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                pressed && { transform: [{ scale: 0.92 }] },
              ]}
            >
              <PaperPlaneTilt
                size={18}
                weight="bold"
                color={input.trim() ? colors.onPrimary : colors.muted}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.60)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 100,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        } as any)
      : {}),
  },
  container: {
    width: '100%',
    height: '86%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    display: 'flex',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          boxShadow: '0 -16px 48px rgba(0, 0, 0, 0.5)',
        } as any)
      : {}),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.titleSm,
    fontWeight: '700',
    fontSize: 16,
  },
  headerSub: {
    ...typography.caption,
    fontSize: 11,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 18,
    gap: 14,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  aiLabelText: {
    ...typography.labelCaps,
    fontSize: 10,
    fontWeight: '700',
  },
  messageText: {
    ...typography.bodySm,
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    ...typography.caption,
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  loadingText: {
    fontSize: 12,
  },
  chipsSection: {
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: 42,
    outlineStyle: 'none' as any,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
