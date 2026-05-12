import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { 
  fetchConversations, 
  sendMessage, 
  startConversation,
  fetchUnreadCount
} from '../../store/slices/messageSlice';

const MessageTestPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { unreadCount, loading, error } = useSelector((state: RootState) => state.message);
  const [testResult, setTestResult] = useState<string>('');
  const [receiverIdInput, setReceiverIdInput] = useState<string>('');

  const parsedReceiverId = Number(receiverIdInput)
  const receiverIdValid = Number.isInteger(parsedReceiverId) && parsedReceiverId > 0 && parsedReceiverId !== user?.id

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setTestResult(`⏳ Exécution de ${testName}...`);
    try {
      const result = await testFn();
      setTestResult(`✅ ${testName} réussi: ${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      setTestResult(`❌ ${testName} échoué: ${error.message}`);
    }
  };

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-yellow-800">Vous devez être connecté pour tester la messagerie.</p>
        <a href="/auth" className="text-yellow-600 underline">Se connecter</a>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">🧪 Panel de test - Messagerie</h3>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => runTest('Compteur messages non lus', () => dispatch(fetchUnreadCount()).unwrap())}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Compter non lus
        </button>
        
        <button
          onClick={() => runTest('Liste conversations', () => dispatch(fetchConversations()).unwrap())}
          className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        >
          Lister conversations
        </button>
        
        <button
          onClick={() => runTest('Démarrer conversation', () =>
            dispatch(startConversation({ receiver_id: parsedReceiverId })).unwrap()
          )}
          disabled={!receiverIdValid}
          className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Démarrer conversation
        </button>

        <button
          onClick={() => runTest('Envoyer message test', () =>
            dispatch(sendMessage({
              content: `Test automatique - ${new Date().toLocaleTimeString()}`,
              receiver_id: parsedReceiverId,
              message_type: 'general'
            })).unwrap()
          )}
          disabled={!receiverIdValid}
          className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Envoyer message
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="test-receiver-id" className="text-sm font-medium text-gray-700">
          ID destinataire :
        </label>
        <input
          id="test-receiver-id"
          type="number"
          min={1}
          inputMode="numeric"
          value={receiverIdInput}
          onChange={(e) => setReceiverIdInput(e.target.value)}
          placeholder="ex: 7"
          className="px-2 py-1 border border-gray-300 rounded text-sm w-24"
        />
        {receiverIdInput && !receiverIdValid && (
          <span className="text-xs text-red-600">
            {parsedReceiverId === user?.id ? "C'est ton propre ID" : 'ID invalide'}
          </span>
        )}
      </div>

      <div className="text-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Utilisateur:</span>
          <span>{user.name} ({user.email})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Messages non lus:</span>
          <span className={unreadCount > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
            {unreadCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">État:</span>
          <span className={loading ? 'text-yellow-600' : 'text-green-600'}>
            {loading ? 'Chargement...' : 'Prêt'}
          </span>
        </div>
        {error && (
          <div className="text-red-600 text-sm">
            <span className="font-medium">Erreur:</span> {error}
          </div>
        )}
      </div>

      {testResult && (
        <div className="mt-4 p-3 bg-gray-100 rounded border">
          <pre className="text-xs whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default MessageTestPanel;