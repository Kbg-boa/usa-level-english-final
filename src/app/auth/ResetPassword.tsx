import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../lib/supabaseClient';

function getHashParams() {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  return new URLSearchParams(hash);
}

export function ResetPassword() {
  const navigate = useNavigate();

  const [stage, setStage] = useState<'loading' | 'ready' | 'error' | 'done'>('loading');
  const [error, setError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const url = useMemo(() => new URL(window.location.href), []);

  useEffect(() => {
    (async () => {
      try {
        setError(null);

        // 1) Cas PKCE: ?code=xxxx
        const code = url.searchParams.get('code');
        if (code) {
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exErr) throw exErr;
          setStage('ready');
          return;
        }

        // 2) Cas implicit: #access_token=...&refresh_token=...
        const hashParams = getHashParams();
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');

        if (access_token && refresh_token) {
          const { error: setErr } = await supabase.auth.setSession({ access_token, refresh_token });
          if (setErr) throw setErr;
          setStage('ready');
          return;
        }

        // 3) Si déjà connecté (parfois Supabase met la session)
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setStage('ready');
          return;
        }

        setStage('error');
        setError("Lien invalide ou expiré. Redemande un reset password.");
      } catch (e: any) {
        setStage('error');
        setError(e?.message ?? 'Erreur lors de la préparation du reset password.');
      }
    })();
  }, [url]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Le mot de passe doit avoir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSaving(true);
    try {
      const { error: upErr } = await supabase.auth.updateUser({ password });
      if (upErr) throw upErr;

      // (optionnel) déconnecter pour obliger un login propre
      await supabase.auth.signOut();

      setStage('done');
      setTimeout(() => navigate('/admin/login'), 1200);
    } catch (e: any) {
      setError(e?.message ?? 'Impossible de changer le mot de passe.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 520, border: '1px solid #eee', borderRadius: 16, padding: 24 }}>
        <h1 style={{ margin: 0, marginBottom: 8 }}>Reset Password</h1>
        <p style={{ marginTop: 0, color: '#666' }}>
          Choisis un nouveau mot de passe pour ton compte.
        </p>

        {stage === 'loading' && <p>Chargement…</p>}

        {stage === 'error' && (
          <div style={{ background: '#fff2f2', border: '1px solid #ffd1d1', padding: 12, borderRadius: 12 }}>
            <b>Erreur</b>
            <div>{error}</div>
            <div style={{ marginTop: 10 }}>
              <button onClick={() => navigate('/admin/login')}>Retour login</button>
            </div>
          </div>
        )}

        {stage === 'ready' && (
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
            {error && (
              <div style={{ background: '#fff2f2', border: '1px solid #ffd1d1', padding: 12, borderRadius: 12 }}>
                {error}
              </div>
            )}

            <label style={{ display: 'grid', gap: 6 }}>
              Nouveau mot de passe
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="min 8 caractères"
                required
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              Confirmer mot de passe
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </label>

            <button type="submit" disabled={saving}>
              {saving ? 'Sauvegarde…' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        )}

        {stage === 'done' && (
          <div style={{ background: '#f0fff3', border: '1px solid #bff0c8', padding: 12, borderRadius: 12 }}>
            ✅ Mot de passe changé. Redirection vers login…
          </div>
        )}
      </div>
    </div>
  );
}