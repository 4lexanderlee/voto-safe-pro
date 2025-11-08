import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: '¡Hola! Soy el asistente virtual de Voto Safe. ¿En qué puedo ayudarte?', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const botResponses: Record<string, string> = {
    'votar': 'Para votar, debes seleccionar un candidato en cada una de las 5 categorías electorales y luego presionar el botón "Enviar Voto".',
    'voto': 'Para votar, debes seleccionar un candidato en cada una de las 5 categorías electorales y luego presionar el botón "Enviar Voto".',
    'categorias': 'Las categorías disponibles son: Presidencia, Senado Nacional, Senado Regional, Diputado y Parlamento Andino.',
    'seguridad': 'Tu voto es completamente seguro y anónimo. Utilizamos encriptación de datos y autenticación de dos factores.',
    'ayuda': 'Puedo ayudarte con información sobre cómo votar, las categorías disponibles, seguridad del sistema y más. ¿Qué necesitas saber?',
    'tiempo': 'Tu sesión tiene una duración de 5 minutos. El tiempo restante se muestra en la parte superior de la pantalla.',
    'sesion': 'Tu sesión tiene una duración de 5 minutos. El tiempo restante se muestra en la parte superior de la pantalla.',
    'dni': 'Tu DNI es tu identificación única en el sistema. Lo necesitas para iniciar sesión junto con tu PIN.',
    'pin': 'El PIN es un código de 4 dígitos que estableces al registrarte. Es necesario para acceder a tu cuenta.',
    'registro': 'Para registrarte, ingresa tu DNI de 8 dígitos y el sistema completará automáticamente tus datos. Luego completa tu correo, celular y crea un PIN.',
    'hola': '¡Hola! ¿En qué puedo ayudarte hoy?',
    'gracias': '¡De nada! Estoy aquí para ayudarte. ¿Necesitas algo más?'
  };

  const getResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    for (const [key, response] of Object.entries(botResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }
    
    return 'Lo siento, no entiendo tu pregunta. Puedes preguntarme sobre: cómo votar, categorías, seguridad, tiempo de sesión, registro o ayuda general.';
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user'
    };

    setMessages([...messages, userMessage]);

    setTimeout(() => {
      const botMessage: Message = {
        id: messages.length + 2,
        text: getResponse(inputValue),
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    }, 500);

    setInputValue('');
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="border-b flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">Asistente Virtual</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </CardContent>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu mensaje..."
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatBot;
