import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export default function SupabaseDiagnostic() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'connected' | 'schema_needed' | 'failed'
  const [errorMessage, setErrorMessage] = useState(null);
  const [detailMessage, setDetailMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function checkConnection() {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setStatus('failed');
          setErrorMessage('Supabase environment variables are missing or set to placeholder defaults.');
          setDetailMessage('Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.');
        }
        return;
      }

      try {
        // Minimal query: check public.courses table for 1 id over HTTPS
        const { data, error } = await supabase
          .from('courses')
          .select('id')
          .limit(1);

        if (!isMounted) return;

        if (error) {
          // Check for PostgREST missing table code (PGRST205 / table does not exist)
          if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
            setStatus('schema_needed');
            setErrorMessage('Supabase endpoint reached, but database tables are not yet created.');
            setDetailMessage('Run supabase/schema.sql in your Supabase SQL Editor to initialize the schema.');
          } else if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.code === '401') {
            setStatus('failed');
            setErrorMessage('Supabase authentication failed. Please check the public client key.');
            setDetailMessage(error.message);
          } else {
            setStatus('failed');
            setErrorMessage(`Query returned error code ${error.code || 'UNKNOWN'}.`);
            setDetailMessage(error.message || 'Unknown database response error.');
          }
        } else {
          setStatus('connected');
          setDetailMessage(`Connection verified over HTTPS. Returned ${data ? data.length : 0} rows.`);
        }
      } catch (err) {
        if (!isMounted) return;
        setStatus('failed');
        setErrorMessage('Network connection to Supabase endpoint could not be established.');
        setDetailMessage(err.message || 'Check network connectivity or project URL.');
      }
    }

    checkConnection();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-4 bg-neutral-50 rounded-md border border-neutral-200 mt-4 text-sm">
      <div className="flex items-center gap-2 mb-2 font-semibold">
        <span>Supabase Backend Diagnostic:</span>
        {status === 'checking' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            Checking Connection...
          </span>
        )}
        {status === 'connected' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            Connected Successfully
          </span>
        )}
        {status === 'schema_needed' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            Endpoint Reached (Schema Pending)
          </span>
        )}
        {status === 'failed' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
            Connection Failed
          </span>
        )}
      </div>

      {status === 'checking' && (
        <p className="text-neutral-600 text-xs">
          Querying remote endpoint over HTTPS (<code className="font-mono">courses.select(&apos;id&apos;).limit(1)</code>)...
        </p>
      )}

      {status === 'connected' && (
        <p className="text-emerald-700 text-xs">
          ✅ Supabase client is configured and verified over HTTPS. {detailMessage}
        </p>
      )}

      {status === 'schema_needed' && (
        <div className="space-y-1 text-xs">
          <p className="text-blue-900 font-medium">ℹ️ {errorMessage}</p>
          <p className="text-neutral-600">{detailMessage}</p>
        </div>
      )}

      {status === 'failed' && (
        <div className="space-y-1 text-xs">
          <p className="text-rose-700 font-medium">❌ {errorMessage}</p>
          {detailMessage && <p className="text-neutral-600">{detailMessage}</p>}
        </div>
      )}
    </div>
  );
}
