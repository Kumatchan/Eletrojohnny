declare module 'imap-simple' {
  export interface ImapSimpleConfig {
    user: string;
    password: string;
    host: string;
    port: number;
    tls: boolean;
    authTimeout?: number;
  }

  export interface MessageAttributes {
    subject?: string;
    date?: string;
    from?: string;
    to?: string;
  }

  export interface MessagePart {
    which: string;
    body?: string;
  }

  export interface Message {
    attributes: MessageAttributes;
    parts: MessagePart[];
  }

  export interface ImapSimple {
    openBox(boxName: string): Promise<void>;
    search(searchCriteria: any[], fetchOptions: any): Promise<Message[]>;
    end(): void;
  }

  export function connect(config: ImapSimpleConfig): Promise<ImapSimple>;
}
