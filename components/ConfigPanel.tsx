/**
 * ============================================================================
 * ConfigPanel | Enterprise Configuration System v85.0
 * ============================================================================
 * SOTA Features:
 * - Secure sync encryption/decryption (fixes Promise<string> errors)
 * - Multi-provider AI configuration
 * - Connection testing with visual feedback
 * - Tabbed interface with smooth transitions
 * - Input validation with error states
 * - Accessibility-first design
 * - Performance optimizations
 * - Type-safe AmazonRegion handling
 * ============================================================================
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AppConfig, AIProvider, BoxStyle, AmazonRegion } from '../types';
import { testConnection, SecureStorage, sanitizeAppConfig, decodeStoredSecretSync, decodeStoredSecret, isEncryptedSecretPayload } from '../utils';
import { toast } from 'sonner';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ConfigPanelProps {
  onSave: (config: AppConfig) => void;
  initialConfig: AppConfig;
}

type ConfigTab = 'wp' | 'amazon' | 'ai' | 'sota';
type TestConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

interface TabConfig {
  id: ConfigTab;
  label: string;
  icon: string;
}

interface AIProviderConfig {
  id: AIProvider;
  name: string;
  models: { value: string; label: string }[];
  keyField: keyof AppConfig;
  color: string;
  description: string;
  supportsCustomModel?: boolean;
}

interface AmazonRegionOption {
  value: AmazonRegion;
  label: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TABS: TabConfig[] = [
  { id: 'wp', label: 'WordPress', icon: 'fa-wordpress' },
  { id: 'amazon', label: 'Amazon', icon: 'fa-amazon' },
  { id: 'ai', label: 'Brain Core', icon: 'fa-brain' },
  { id: 'sota', label: 'SOTA Flags', icon: 'fa-sliders' },
];

const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    keyField: 'geminiApiKey',
    color: 'blue',
    description: 'Gemini 2.0 Flash provides the best balance of speed and accuracy.',
    models: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Recommended)' },
      { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    keyField: 'openaiApiKey',
    color: 'green',
    description: 'GPT-4o is recommended for highest quality product extraction.',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o (Recommended)' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    keyField: 'anthropicApiKey',
    color: 'orange',
    description: 'Claude 3.5 Sonnet offers excellent reasoning and accuracy.',
    models: [
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Latest)' },
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    keyField: 'groqApiKey',
    color: 'purple',
    description: 'Groq provides ultra-fast inference for supported models.',
    supportsCustomModel: true,
    models: [],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    keyField: 'openrouterApiKey',
    color: 'amber',
    description: 'OpenRouter gives you access to 100+ models from one API.',
    supportsCustomModel: true,
    models: [],
  },
];

const AMAZON_REGION_OPTIONS: AmazonRegionOption[] = [
  { value: 'us-east-1', label: '🇺🇸 United States (amazon.com)' },
  { value: 'eu-west-1', label: '🇬🇧 United Kingdom (amazon.co.uk)' },
  { value: 'eu-west-2', label: '🇩🇪 Germany (amazon.de)' },
  { value: 'eu-west-3', label: '🇫🇷 France (amazon.fr)' },
  { value: 'ap-northeast-1', label: '🇯🇵 Japan (amazon.co.jp)' },
  { value: 'ap-south-1', label: '🇮🇳 India (amazon.in)' },
  { value: 'ap-southeast-1', label: '🇸🇬 Singapore (amazon.sg)' },
  { value: 'ap-southeast-2', label: '🇦🇺 Australia (amazon.com.au)' },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Sensitive config fields that need encryption */
const SENSITIVE_FIELDS: (keyof AppConfig)[] = [
  'amazonAccessKey',
  'amazonSecretKey',
  'wpAppPassword',
  'serpApiKey',
  'geminiApiKey',
  'openaiApiKey',
  'anthropicApiKey',
  'groqApiKey',
  'openrouterApiKey',
];

/**
 * Detect whether a stored value is AES-GCM (v3:) encrypted.
 * v3: payloads cannot be decoded by decryptSync — must use async decrypt.
 */
const isAesEncrypted = (value: string | undefined): boolean =>
  typeof value === 'string' && value.startsWith('v3:');

/**
 * Safely decrypt a value (sync legacy formats only).
 */
const safeDecrypt = (value: string | undefined): string => {
  if (!value) return '';
  return decodeStoredSecretSync(value);
};

/**
 * Decrypt all sensitive fields from config (sync for initial render).
 * If any field is AES-GCM (v3:) encrypted, returns the value unchanged so
 * that the async decrypt pass can recover it (otherwise we'd silently wipe
 * the user's saved secret).
 */
const decryptConfig = (config: AppConfig): AppConfig => {
  const result: Record<string, any> = { ...config };
  for (const field of SENSITIVE_FIELDS) {
    const raw = config[field as keyof AppConfig] as string | undefined;
    if (isAesEncrypted(raw)) {
      // Preserve ciphertext; decryptConfigAsync will decode it.
      result[field as string] = raw;
    } else {
      result[field as string] = safeDecrypt(raw);
    }
  }
  return sanitizeAppConfig(result as AppConfig);
};

/**
 * Async decrypt — handles AES-GCM (v3:) values produced by encryptConfigAsync.
 * REQUIRED for loading saved presets, otherwise sensitive fields come back blank
 * and the preset appears "lost".
 */
const decryptConfigAsync = async (config: AppConfig): Promise<AppConfig> => {
  const result: Record<string, any> = { ...config };
  for (const field of SENSITIVE_FIELDS) {
    const val = config[field as keyof AppConfig] as string | undefined;
    if (!val) { result[field as string] = ''; continue; }
    if (isAesEncrypted(val) || isEncryptedSecretPayload(val)) {
      result[field as string] = await decodeStoredSecret(val);
    } else {
      result[field as string] = safeDecrypt(val);
    }
  }
  return sanitizeAppConfig(result as AppConfig);
};

/**
 * Encrypt all sensitive fields using async AES-GCM
 */
const encryptConfigAsync = async (config: AppConfig): Promise<AppConfig> => {
  const result: Record<string, any> = { ...config };
  for (const field of SENSITIVE_FIELDS) {
    const val = config[field as keyof AppConfig] as string | undefined;
    if (val) {
      result[field as string] = await SecureStorage.encrypt(val);
    }
  }
  return result as AppConfig;
};

// ============================================================================
// PRESETS — save / load multiple named configurations
// ============================================================================

const PRESETS_KEY = 'amzwp_config_presets_v1';

interface ConfigPreset {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  config: AppConfig; // stored with sensitive fields ALREADY encrypted
}

const loadPresets = (): ConfigPreset[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((preset): preset is ConfigPreset => {
      return !!preset && typeof preset === 'object' && typeof preset.id === 'string' && typeof preset.name === 'string' && !!preset.config;
    });
  } catch {
    return [];
  }
};

const savePresets = (presets: ConfigPreset[]) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch {
    /* quota / disabled — non-fatal */
  }
};

// ============================================================================
// VALIDATION
// ============================================================================

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

const validateConfig = (config: AppConfig, tab: ConfigTab): ValidationResult => {
  const errors: Record<string, string> = {};

  if (tab === 'wp') {
    if (!config.wpUrl?.trim()) {
      errors.wpUrl = 'Site URL is required';
    } else if (!/^https?:\/\/.+/.test(config.wpUrl.trim())) {
      errors.wpUrl = 'Invalid URL format (must start with http:// or https://)';
    }
    if (!config.wpUser?.trim()) {
      errors.wpUser = 'Username is required';
    }
    if (!config.wpAppPassword?.trim()) {
      errors.wpAppPassword = 'App password is required';
    }
  }

  if (tab === 'amazon') {
    if (!config.amazonTag?.trim()) {
      errors.amazonTag = 'Associate Tag is required';
    }
    if (
      typeof config.serpApiCallBudget !== 'number' ||
      Number.isNaN(config.serpApiCallBudget) ||
      config.serpApiCallBudget < 1 ||
      config.serpApiCallBudget > 50
    ) {
      errors.serpApiCallBudget = 'Budget must be between 1 and 50 calls per scan';
    }
    if (
      typeof config.serpApiMinCandidateScore !== 'number' ||
      Number.isNaN(config.serpApiMinCandidateScore) ||
      config.serpApiMinCandidateScore < 0 ||
      config.serpApiMinCandidateScore > 100
    ) {
      errors.serpApiMinCandidateScore = 'Minimum score must be between 0 and 100';
    }
  }

  if (tab === 'ai') {
    const provider = AI_PROVIDERS.find(p => p.id === config.aiProvider);
    if (provider) {
      const keyField = provider.keyField as keyof AppConfig;
      if (!config[keyField]) {
        errors[keyField as string] = `${provider.name} API key is required`;
      }
      if (provider.supportsCustomModel && !config.customModel?.trim()) {
        errors.customModel = 'Model name is required for this provider';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface InputFieldProps {
  label: string;
  type?: 'text' | 'password' | 'url' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  icon?: string;
  helpText?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  icon,
  helpText,
}) => (
  <div className="space-y-2">
    <label className="text-[10px] text-brand-500 font-black uppercase tracking-widest flex items-center gap-2">
      {icon && <i className={`fa-solid ${icon} text-brand-400`} />}
      {label}
      {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-dark-950 border rounded-xl px-4 py-3 text-white outline-none transition-all ${
        error 
          ? 'border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20' 
          : 'border-dark-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
      }`}
    />
    {error && (
      <p className="text-[10px] text-red-400 flex items-center gap-1">
        <i className="fa-solid fa-exclamation-circle" />
        {error}
      </p>
    )}
    {helpText && !error && (
      <p className="text-[10px] text-gray-500">{helpText}</p>
    )}
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  icon,
}) => (
  <div className="space-y-2">
    {label && (
      <label className="text-[10px] text-brand-500 font-black uppercase tracking-widest flex items-center gap-2">
        {icon && <i className={`fa-solid ${icon}`} />}
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

interface ToggleFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: string;
}

const ToggleField: React.FC<ToggleFieldProps> = ({
  label,
  description,
  checked,
  onChange,
  icon,
}) => (
  <div 
    className="flex items-center justify-between p-4 bg-dark-950 border border-dark-700 rounded-2xl cursor-pointer hover:border-dark-600 transition-colors group"
    onClick={() => onChange(!checked)}
    role="switch"
    aria-checked={checked}
    tabIndex={0}
    onKeyDown={e => e.key === 'Enter' && onChange(!checked)}
  >
    <div className="flex items-center gap-3">
      {icon && (
        <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center group-hover:bg-dark-700 transition-colors">
          <i className={`fa-solid ${icon} text-gray-400 text-sm`} />
        </div>
      )}
      <div>
        <span className="text-xs font-bold text-white">{label}</span>
        {description && (
          <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
    </div>
    <div className={`relative w-12 h-6 rounded-full transition-all ${checked ? 'bg-brand-500' : 'bg-dark-700'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg transition-all ${checked ? 'left-7' : 'left-1'}`} />
    </div>
  </div>
);

interface InfoBoxProps {
  type: 'info' | 'warning' | 'success' | 'error';
  icon: string;
  children: React.ReactNode;
}

const InfoBox: React.FC<InfoBoxProps> = ({ type, icon, children }) => {
  const colorClasses = {
    info: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
    success: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
    error: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
  };
  const c = colorClasses[type];

  return (
    <div className={`p-4 ${c.bg} border ${c.border} rounded-xl`}>
      <p className={`text-xs ${c.text} flex items-start gap-2`}>
        <i className={`fa-solid ${icon} mt-0.5`} />
        <span>{children}</span>
      </p>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ onSave, initialConfig }) => {
  // ========== STATE ==========
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ConfigTab>('wp');
  const [testConnectionStatus, setTestConnectionStatus] = useState<TestConnectionStatus>('idle');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Decrypt initial config on mount (sync first, then async pass for AES-GCM v3 values)
  const [config, setConfig] = useState<AppConfig>(() => decryptConfig(initialConfig));

  // Re-decrypt when initialConfig changes — async pass recovers AES-encrypted secrets
  useEffect(() => {
    let cancelled = false;
    setConfig(decryptConfig(initialConfig));
    decryptConfigAsync(initialConfig).then(c => { if (!cancelled) setConfig(c); }).catch(() => { /* noop */ });
    return () => { cancelled = true; };
  }, [initialConfig]);

  // ---------- Presets ----------
  const [presets, setPresets] = useState<ConfigPreset[]>(() => loadPresets());
  const [activePresetId, setActivePresetId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('amzwp_active_preset_id');
  });
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [presetName, setPresetName] = useState('');

  const persistPresets = useCallback((next: ConfigPreset[]) => {
    setPresets(next);
    savePresets(next);
  }, []);

  const handleSaveAsPreset = useCallback(async () => {
    const name = presetName.trim();
    if (!name) {
      toast.error('Give your configuration a name');
      return;
    }
    try {
      const normalized = sanitizeAppConfig(config);
      const encrypted = await encryptConfigAsync(normalized);
      const now = Date.now();
      const id = `preset_${now}_${Math.random().toString(36).slice(2, 8)}`;
      const newPreset: ConfigPreset = { id, name, createdAt: now, updatedAt: now, config: encrypted };
      const next = [...presets, newPreset];
      persistPresets(next);
      setActivePresetId(id);
      try { window.localStorage.setItem('amzwp_active_preset_id', id); } catch { /* noop */ }
      setShowSaveAs(false);
      setPresetName('');
      toast.success(`✓ Saved "${name}"`);
    } catch {
      toast.error('Failed to save preset');
    }
  }, [config, presetName, presets, persistPresets]);

  const handleUpdateCurrentPreset = useCallback(async () => {
    if (!activePresetId) return;
    try {
      const normalized = sanitizeAppConfig(config);
      const encrypted = await encryptConfigAsync(normalized);
      const next = presets.map(p =>
        p.id === activePresetId ? { ...p, config: encrypted, updatedAt: Date.now() } : p
      );
      persistPresets(next);
      const target = next.find(p => p.id === activePresetId);
      toast.success(`✓ Updated "${target?.name ?? 'preset'}"`);
    } catch {
      toast.error('Failed to update preset');
    }
  }, [activePresetId, config, persistPresets, presets]);

  const handleLoadPreset = useCallback(async (id: string) => {
    const preset = presets.find(p => p.id === id);
    if (!preset) return;
    try {
      const decrypted = await decryptConfigAsync(preset.config);
      setConfig(decrypted);
      onSave(await encryptConfigAsync(decrypted));
    } catch {
      const fallback = decryptConfig(preset.config);
      setConfig(fallback);
      onSave(await encryptConfigAsync(fallback));
    }
    setActivePresetId(id);
    try { window.localStorage.setItem('amzwp_active_preset_id', id); } catch { /* noop */ }
    setValidationErrors({});
    toast.success(`Loaded "${preset.name}"`);
  }, [onSave, presets]);

  const handleDeletePreset = useCallback((id: string) => {
    const target = presets.find(p => p.id === id);
    if (!target) return;
    if (!window.confirm(`Delete preset "${target.name}"?`)) return;
    const next = presets.filter(p => p.id !== id);
    persistPresets(next);
    if (activePresetId === id) {
      setActivePresetId(null);
      try { window.localStorage.removeItem('amzwp_active_preset_id'); } catch { /* noop */ }
    }
    toast.success('Preset deleted');
  }, [presets, activePresetId, persistPresets]);

  const activePreset = useMemo(
    () => presets.find(p => p.id === activePresetId) ?? null,
    [presets, activePresetId]
  );

  // ========== MEMOIZED VALUES ==========
  const currentProvider = useMemo(
    () => AI_PROVIDERS.find(p => p.id === config.aiProvider),
    [config.aiProvider]
  );

  const completionPercentage = useMemo(() => {
    let filled = 0;
    let total = 0;

    // WordPress fields
    if (config.wpUrl) filled++;
    if (config.wpUser) filled++;
    if (config.wpAppPassword) filled++;
    total += 3;

    // Amazon fields
    if (config.amazonTag) filled++;
    total += 1;

    // AI fields
    if (currentProvider) {
      const keyField = currentProvider.keyField as keyof AppConfig;
      if (config[keyField]) filled++;
      total += 1;
    }

    return Math.round((filled / total) * 100);
  }, [config, currentProvider]);

  // ========== HANDLERS ==========
  const updateConfig = useCallback(<K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    // Mirror the Associates tag to a plain localStorage key so the public
    // landing-page demo and any non-encrypted surface can read it without
    // going through SecureStorage.
    if (key === 'amazonTag' && typeof window !== 'undefined') {
      try {
        const v = String(value ?? '').trim();
        if (v) window.localStorage.setItem('amzwp.affiliateTag', v);
        else window.localStorage.removeItem('amzwp.affiliateTag');
      } catch { /* storage disabled — non-fatal */ }
    }
    // Clear validation error when field is updated
    if (validationErrors[key as string]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  }, [validationErrors]);

  const handleProviderChange = useCallback((provider: AIProvider) => {
    const providerConfig = AI_PROVIDERS.find(p => p.id === provider);
    setConfig(prev => ({
      ...prev,
      aiProvider: provider,
      aiModel: providerConfig?.models[0]?.value || '',
      customModel: '',
    }));
  }, []);

  const handleTestConnection = useCallback(async () => {
    const normalizedConfig = sanitizeAppConfig(config);
    const validation = validateConfig(normalizedConfig, 'wp');

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error('Please fill in all required fields');
      return;
    }

    setTestConnectionStatus('testing');
    setValidationErrors({});

    try {
      const result = await testConnection(normalizedConfig);

      if (result.success) {
        setTestConnectionStatus('success');
        toast.success(result.message || '✓ Connected to WordPress!');
      } else {
        setTestConnectionStatus('error');
        toast.error(result.message || 'Connection failed');
      }
    } catch (error: any) {
      setTestConnectionStatus('error');
      toast.error(error.message || 'Connection failed - please check your credentials');
    }
  }, [config]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedConfig = sanitizeAppConfig(config);
    
    // Validate current tab
    const validation = validateConfig(normalizedConfig, activeTab);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
            toast.error('Please fix validation errors');
        return;
    }

    setIsSaving(true);

    try {
      // Encrypt sensitive fields using async AES-GCM before saving
      const encryptedConfig = await encryptConfigAsync(normalizedConfig);
      onSave(encryptedConfig);
      setIsOpen(false);
      toast.success('✓ Configuration Saved');
    } catch {
      toast.error('Failed to encrypt config');
    } finally {
      setIsSaving(false);
    }
      }, [config, activeTab, onSave]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setValidationErrors({});
    setTestConnectionStatus('idle');
  }, []);

  // ========== RENDER HELPERS ==========
  const renderWordPressTab = () => (
    <div className="space-y-4 animate-fade-in">
      <InputField
        label="Site URL"
        type="url"
        value={config.wpUrl}
        onChange={v => updateConfig('wpUrl', v)}
        placeholder="https://mysite.com"
        error={validationErrors.wpUrl}
        required
        icon="fa-globe"
        helpText="Your WordPress site URL (without trailing slash)"
      />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Username"
          value={config.wpUser}
          onChange={v => updateConfig('wpUser', v)}
          placeholder="admin"
          error={validationErrors.wpUser}
          required
          icon="fa-user"
        />
        <InputField
          label="App Password"
          type="password"
          value={config.wpAppPassword}
          onChange={v => updateConfig('wpAppPassword', v)}
          placeholder="xxxx xxxx xxxx xxxx"
          error={validationErrors.wpAppPassword}
          required
          icon="fa-key"
        />
      </div>

      <button
        type="button"
        onClick={handleTestConnection}
        disabled={testConnectionStatus === 'testing'}
        className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
          testConnectionStatus === 'success'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : testConnectionStatus === 'error'
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'bg-dark-800 text-gray-400 border border-dark-700 hover:bg-dark-700 hover:text-white'
        }`}
      >
        {testConnectionStatus === 'testing' ? (
          <>
            <i className="fa-solid fa-spinner fa-spin" />
            Testing Connection...
          </>
        ) : testConnectionStatus === 'success' ? (
          <>
            <i className="fa-solid fa-check-circle" />
            Connection Verified
          </>
        ) : testConnectionStatus === 'error' ? (
          <>
            <i className="fa-solid fa-times-circle" />
            Connection Failed - Retry
          </>
        ) : (
          <>
            <i className="fa-solid fa-plug" />
            Test WordPress Connection
          </>
        )}
      </button>

      <InfoBox type="info" icon="fa-info-circle">
        Generate an App Password in WordPress: Users → Profile → Application Passwords
      </InfoBox>
    </div>
  );

  const renderAmazonTab = () => (
    <div className="space-y-4 animate-fade-in">
      <InputField
        label="Associate Tag"
        value={config.amazonTag}
        onChange={v => updateConfig('amazonTag', v)}
        placeholder="yourname-20"
        error={validationErrors.amazonTag}
        required
        icon="fa-tag"
        helpText="Your Amazon Associates tracking ID"
      />

      {/* PA-API credentials — premium accuracy mode */}
      <div className="p-5 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <i className="fa-solid fa-shield-halved text-white text-sm" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Amazon PA-API Credentials</h4>
            <p className="text-[10px] text-amber-300/80">Premium accuracy — official product data, live pricing &amp; Prime status</p>
          </div>
          {(config.amazonAccessKey && config.amazonSecretKey) && (
            <span className="ml-auto text-[9px] font-black uppercase tracking-widest bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded-full">
              <i className="fa-solid fa-check mr-1" />Active
            </span>
          )}
        </div>
        <InputField
          label="Amazon Access Key ID"
          type="password"
          value={config.amazonAccessKey || ''}
          onChange={v => updateConfig('amazonAccessKey', v)}
          placeholder="AKIAxxxxxxxxxxxxxxxx"
          icon="fa-id-card"
          helpText="20-character access key from Amazon Associates → Product Advertising API"
        />
        <InputField
          label="Amazon Secret Access Key"
          type="password"
          value={config.amazonSecretKey || ''}
          onChange={v => updateConfig('amazonSecretKey', v)}
          placeholder="40-character secret"
          icon="fa-key"
          helpText="Encrypted with AES-GCM in this browser only"
        />
        <InfoBox type="success" icon="fa-bolt">
          With PA-API keys filled in, the engine pulls authoritative product data — titles, prices, images, ratings &amp; Prime eligibility — directly from Amazon.
        </InfoBox>
      </div>

      <InputField
        label="SerpApi Key"
        type="password"
        value={config.serpApiKey || ''}
        onChange={v => updateConfig('serpApiKey', v)}
        placeholder="SerpApi key (fallback enrichment)"
        icon="fa-search"
        helpText="Used when PA-API is unavailable, or for candidate search enrichment"
      />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Call budget"
          type="number"
          value={String(config.serpApiCallBudget ?? 8)}
          onChange={v => updateConfig('serpApiCallBudget', Math.max(1, Math.min(50, parseInt(v, 10) || 8)))}
          error={validationErrors.serpApiCallBudget}
          icon="fa-gauge-high"
          helpText="Hard cap on SerpAPI requests per scan"
        />
        <InputField
          label="Min candidate score"
          type="number"
          value={String(config.serpApiMinCandidateScore ?? 35)}
          onChange={v => updateConfig('serpApiMinCandidateScore', Math.max(0, Math.min(100, parseInt(v, 10) || 35)))}
          error={validationErrors.serpApiMinCandidateScore}
          icon="fa-filter"
          helpText="Higher = fewer, more selective product lookups"
        />
      </div>

      <div className="p-4 bg-dark-950 border border-dark-700 rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <i className="fa-brands fa-amazon text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Amazon Region</h4>
            <p className="text-[10px] text-gray-500">Select your marketplace</p>
          </div>
        </div>
        <select
          value={config.amazonRegion}
          onChange={e => updateConfig('amazonRegion', e.target.value as AmazonRegion)}
          className="w-full bg-dark-950 border border-dark-700 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
        >
          {AMAZON_REGION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-4 animate-fade-in">
      {/* Provider Selection */}
      <div>
        <label className="text-[10px] text-brand-500 font-black uppercase tracking-widest mb-3 block">
          AI Provider
        </label>
        <div className="grid grid-cols-2 gap-2">
          {AI_PROVIDERS.map(provider => (
            <button
              key={provider.id}
              type="button"
              onClick={() => handleProviderChange(provider.id)}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                config.aiProvider === provider.id
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-dark-700 bg-dark-800 hover:border-dark-600'
              }`}
            >
              <span className={`text-xs font-bold ${
                config.aiProvider === provider.id ? 'text-white' : 'text-gray-400'
              }`}>
                {provider.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* API Key Input */}
      {currentProvider && (
        <InputField
          label={`${currentProvider.name} API Key`}
          type="password"
          value={(config[currentProvider.keyField as keyof AppConfig] as string) || ''}
          onChange={v => updateConfig(currentProvider.keyField as keyof AppConfig, v as any)}
          placeholder={`Enter ${currentProvider.name} API Key`}
          error={validationErrors[currentProvider.keyField as string]}
          required
          icon="fa-key"
        />
      )}

      {/* Model Selection */}
      {currentProvider && !currentProvider.supportsCustomModel && currentProvider.models.length > 0 && (
        <SelectField
          label="Model"
          value={config.aiModel}
          onChange={v => updateConfig('aiModel', v)}
          options={currentProvider.models}
          icon="fa-microchip"
        />
      )}

      {/* Custom Model Input */}
      {currentProvider?.supportsCustomModel && (
        <InputField
          label="Model Name"
          value={config.customModel || ''}
          onChange={v => updateConfig('customModel', v)}
          placeholder={currentProvider.id === 'groq' 
            ? 'e.g., llama-3.3-70b-versatile' 
            : 'e.g., anthropic/claude-3.5-sonnet'}
          error={validationErrors.customModel}
          required
          icon="fa-microchip"
          helpText={currentProvider.id === 'groq'
            ? 'Popular: llama-3.3-70b-versatile, mixtral-8x7b-32768'
            : 'Popular: anthropic/claude-3.5-sonnet, google/gemini-pro'}
        />
      )}

      {/* Provider Info */}
      {currentProvider && (
        <InfoBox type="info" icon="fa-lightbulb">
          {currentProvider.description}
        </InfoBox>
      )}
    </div>
  );

  const renderSOTATab = () => (
    <div className="space-y-4 animate-fade-in">
      {/* Product Box Style */}
      <div className="p-5 bg-dark-950 border border-dark-700 rounded-2xl">
        <label className="text-[10px] text-brand-500 font-black uppercase tracking-widest mb-4 block">
          Product Box Design
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { 
              id: 'CLASSIC' as BoxStyle, 
              label: 'Classic', 
              description: 'Clean & Minimal',
              icon: 'fa-rectangle-list',
              color: 'brand'
            },
            { 
              id: 'PREMIUM' as BoxStyle, 
              label: 'Premium', 
              description: 'Luxe Aurora',
              icon: 'fa-gem',
              color: 'violet'
            },
          ].map(style => (
            <button
              key={style.id}
              type="button"
              onClick={() => updateConfig('boxStyle', style.id)}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                config.boxStyle === style.id
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-dark-600 bg-dark-800 hover:border-dark-500'
              }`}
            >
              {config.boxStyle === style.id && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-check text-white text-[8px]" />
                </div>
              )}
              <i className={`fa-solid ${style.icon} text-2xl ${
                style.id === 'PREMIUM' ? 'text-violet-400' : 'text-gray-400'
              } mb-2 block`} />
              <span className="text-xs font-bold text-white block">{style.label}</span>
              <span className={`text-[9px] ${
                style.id === 'PREMIUM' ? 'text-violet-400' : 'text-gray-500'
              }`}>
                {style.description}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-3">
          <i className="fa-solid fa-info-circle mr-1 text-gray-600" />
          {config.boxStyle === 'PREMIUM'
            ? 'Ultra-premium glass morphism design with aurora gradients and micro-animations.'
            : 'Professional clean design with strong visual hierarchy.'}
        </p>
      </div>

      {/* Feature Toggles */}
      <ToggleField
        label="Inject JSON-LD Schema"
        description="Add structured data for better SEO"
        checked={config.enableSchema}
        onChange={v => updateConfig('enableSchema', v)}
        icon="fa-code"
      />

      <ToggleField
        label="Precision Placement"
        description="Auto-place products in intro/outro sections"
        checked={config.enableStickyBar}
        onChange={v => updateConfig('enableStickyBar', v)}
        icon="fa-crosshairs"
      />

      {/* Advanced Settings */}
      <div className="p-4 bg-dark-950 border border-dark-700 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <i className="fa-solid fa-sliders text-gray-500" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Advanced</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 block">
              Concurrency Limit
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={config.concurrencyLimit}
              onChange={e => updateConfig('concurrencyLimit', parseInt(e.target.value) || 5)}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 block">
              Auto-Publish Threshold
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={config.autoPublishThreshold}
              onChange={e => updateConfig('autoPublishThreshold', parseInt(e.target.value) || 85)}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // ========== MAIN RENDER ==========
  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 bg-dark-900/80 backdrop-blur-xl p-4 rounded-2xl text-brand-400 border border-dark-700 hover:scale-110 hover:border-brand-500 transition-all shadow-2xl group"
        title="Open Configuration"
      >
        <i className="fa-solid fa-gear text-xl group-hover:rotate-90 transition-transform duration-300" />
        {completionPercentage < 100 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-[8px] font-black text-dark-950 flex items-center justify-center">
            !
          </span>
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in"
          onClick={e => e.target === e.currentTarget && handleClose()}
        >
          <div className="bg-dark-900 border border-dark-800 w-full max-w-2xl rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 md:p-8 border-b border-dark-800 bg-dark-950/50">
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter">
                  System Configuration
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {completionPercentage}% configured
                  {activePreset && (
                    <> · <span className="text-brand-400 font-bold">{activePreset.name}</span></>
                  )}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-dark-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 flex items-center justify-center transition-all"
              >
                <i className="fa-solid fa-times text-lg" />
              </button>
            </div>

            {/* Presets bar — save / load multiple named configurations */}
            <div className="px-6 md:px-8 py-4 border-b border-dark-800 bg-dark-950/30">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-400">
                  <i className="fa-solid fa-layer-group" />
                  Configurations
                </div>

                <div className="flex-1 min-w-[180px]">
                  <select
                    value={activePresetId ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) handleLoadPreset(v);
                    }}
                    className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="">
                      {presets.length === 0 ? '— No saved configurations yet —' : 'Load a saved configuration…'}
                    </option>
                    {presets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {activePreset && (
                  <>
                    <button
                      type="button"
                      onClick={handleUpdateCurrentPreset}
                      className="px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-brand-300 text-[10px] font-black uppercase tracking-widest border border-dark-700 hover:border-brand-500/40 transition-all flex items-center gap-1.5"
                      title="Overwrite this preset with current values"
                    >
                      <i className="fa-solid fa-rotate" /> Update
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePreset(activePreset.id)}
                      className="px-3 py-2 rounded-xl bg-dark-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-[10px] font-black uppercase tracking-widest border border-dark-700 hover:border-red-500/40 transition-all flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setShowSaveAs((s) => !s)}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:from-brand-500 hover:to-purple-500 transition-all flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-plus" /> Save as
                </button>
              </div>

              {showSaveAs && (
                <div className="mt-3 flex items-center gap-2 animate-fade-in">
                  <input
                    type="text"
                    autoFocus
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); void handleSaveAsPreset(); }
                      if (e.key === 'Escape') { setShowSaveAs(false); setPresetName(''); }
                    }}
                    placeholder="e.g. Tech Blog · US · Gemini"
                    className="flex-1 bg-dark-900 border border-dark-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSaveAsPreset()}
                    className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowSaveAs(false); setPresetName(''); }}
                    className="px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-gray-400 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-dark-800">
              <div 
                className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-dark-800 bg-dark-950/50">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setValidationErrors({});
                  }}
                  className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-brand-400 border-b-2 border-brand-500 bg-brand-500/5'
                      : 'text-gray-500 hover:text-gray-400 hover:bg-dark-800/50'
                  }`}
                >
                  <i className={`fa-${tab.icon.includes('amazon') || tab.icon.includes('wordpress') ? 'brands' : 'solid'} ${tab.icon}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 md:p-8 space-y-6">
                {activeTab === 'wp' && renderWordPressTab()}
                {activeTab === 'amazon' && renderAmazonTab()}
                {activeTab === 'ai' && renderAITab()}
                {activeTab === 'sota' && renderSOTATab()}
              </div>

              {/* Footer */}
              <div className="p-6 md:p-8 border-t border-dark-800 bg-dark-950/50">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-save" />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default ConfigPanel;
