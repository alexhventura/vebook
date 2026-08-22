import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { PageHeader } from '../ui/PageHeader';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Breadcrumb } from '../ui/Breadcrumb';
import { PATHS } from '../../lib/paths';

export const ContatoView: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  return (
    <div className="bg-[#F8FAFC] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <Breadcrumb items={[{ label: 'VEBOOK', to: PATHS.home }, { label: 'Contato' }]} />
        <PageHeader
          title="Contato"
          description="Use este canal para dúvidas sobre a plataforma, cadastro de oficinas ou tratamento de informações."
        />
        <Card>
          {sent ? (
            <Alert tone="success" title="Mensagem registrada">
              Recebemos sua mensagem. O retorno institucional será feito quando os canais oficiais estiverem em operação.
            </Alert>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <Input
                id="contato-nome"
                label="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                id="contato-email"
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="space-y-1.5">
                <label htmlFor="contato-mensagem" className="block text-sm font-semibold text-slate-800">
                  Mensagem
                </label>
                <textarea
                  id="contato-mensagem"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-base"
                />
              </div>
              <Button type="submit">
                <Mail className="h-4 w-4" aria-hidden />
                Enviar
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
