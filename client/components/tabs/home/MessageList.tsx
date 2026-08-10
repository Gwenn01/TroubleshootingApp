import { useRef } from "react";
import { FlatList } from "react-native";
import { ChatBubble } from "./Chatbubble";
import { TypingIndicator } from "./TypingIndicator";
import type { Message, MessageOption } from "../../../types/chat";

type Props = {
  messages: Message[];
  isAssistantTyping: boolean;
  /** Shown next to the typing dots while a search is in flight. */
  typingLabel?: string;
  onSelectOption?: (option: MessageOption) => void;
};

export function MessageList({
  messages,
  isAssistantTyping,
  typingLabel,
  onSelectOption,
}: Props) {
  const listRef = useRef<FlatList<Message>>(null);

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <ChatBubble message={item} onSelectOption={onSelectOption} />
      )}
      className="flex-1 px-4"
      contentContainerStyle={{ paddingTop: 20, paddingBottom: 12 }}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() =>
        listRef.current?.scrollToEnd({ animated: true })
      }
      ListFooterComponent={
        isAssistantTyping ? <TypingIndicator label={typingLabel} /> : null
      }
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={7}
    />
  );
}
