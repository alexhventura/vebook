import React, { useState } from 'react';
import { changeOfficeUserPassword, updateOfficeUserProfile } from '../../data/officeStore';
import { formatCpf } from '../../lib/cpf';
import { formatPhone } from '../../lib/phone';
import { onlyDigits } from '../../lib/cpf';
import { OfficeUser } from '../../types';
import { Field, inputClass } from '../ui/Field';
import { SectionTitle } from './shared';

export const PerfilSection: React.FC<{ user: OfficeUser }> = ({ user }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [message, setMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  return (
    <section className="space-y-4">
      <SectionTitle title="Perfil" subtitle="Dados do usuário responsável pelo acesso ao painel." />
      <form
        className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void updateOfficeUserProfile(user.id, { fullName, phone, email }).then(() => setMessage('Perfil atualizado.'));
        }}
      >
        <Field label="Nome"><input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
        <Field label="CPF" hint="O CPF é usado no login e não pode ser alterado livremente neste painel.">
          <input className={inputClass} value={formatCpf(user.cpf)} disabled />
        </Field>
        <Field label="Telefone"><input className={inputClass} value={formatPhone(phone)} onChange={(e) => setPhone(onlyDigits(e.target.value))} /></Field>
        <Field label="E-mail"><input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <button className="sm:col-span-2 rounded-xl bg-[#0B1E36] text-white font-bold text-sm py-2.5 cursor-pointer">Salvar perfil</button>
        {message ? <p className="sm:col-span-2 text-sm text-emerald-700 font-bold">{message}</p> : null}
      </form>

      <form
        className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setPasswordMessage('');
          void changeOfficeUserPassword(user.id, currentPassword, nextPassword)
            .then(() => {
              setPasswordMessage('Senha atualizada.');
              setCurrentPassword('');
              setNextPassword('');
            })
            .catch((err) => setPasswordMessage(err instanceof Error ? err.message : 'Não foi possível alterar a senha.'));
        }}
      >
        <h3 className="sm:col-span-2 font-extrabold text-[#0B1E36]">Senha</h3>
        <Field label="Senha atual"><input className={inputClass} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></Field>
        <Field label="Nova senha"><input className={inputClass} type="password" value={nextPassword} onChange={(e) => setNextPassword(e.target.value)} /></Field>
        <button className="sm:col-span-2 rounded-xl bg-slate-900 text-white font-bold text-sm py-2.5 cursor-pointer">Alterar senha</button>
        {passwordMessage ? <p className="sm:col-span-2 text-sm font-bold text-slate-700">{passwordMessage}</p> : null}
      </form>
    </section>
  );
};
