interface User {
  name: string;
  email: string;
  image: string;
  id: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

interface Chat {
  id: string;
  messages: Message[];
  users: User[];
}

interface ChatPartner {
  id: string;
  name: string;
  image: string;
}

interface friendRequest {
  id: string;
  senderId: string;
  receiverId: string;
}
