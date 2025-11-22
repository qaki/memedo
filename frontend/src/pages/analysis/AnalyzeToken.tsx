import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { AnalysisResults } from '../../components/analysis/AnalysisResults';
import { useAnalysisStore } from '../../stores/analysis.store';
import { useToast } from '../../hooks/useToast';

// Chain-specific address validation patterns
const ADDRESS_PATTERNS = {
  ethereum: /^0x[a-fA-F0-9]{40}$/,
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  bsc: /^0x[a-fA-F0-9]{40}$/,
  base: /^0x[a-fA-F0-9]{40}$/,
  polygon: /^0x[a-fA-F0-9]{40}$/,
  avalanche: /^0x[a-fA-F0-9]{40}$/,
};

// Form validation schema
const analyzeTokenSchema = z.object({
  chain: z
    .string()
    .min(1, 'Please select a blockchain')
    .refine((val) => val !== '', 'Please select a blockchain'),
  tokenAddress: z.string().min(1, 'Token address is required'),
});

type AnalyzeTokenForm = z.infer<typeof analyzeTokenSchema>;

const AnalyzeToken = () => {
  const toast = useToast();
  const {
    supportedChains,
    fetchSupportedChains,
    currentAnalysis,
    isAnalyzing,
    analyzeToken,
    clearError,
  } = useAnalysisStore();

  const [selectedChain, setSelectedChain] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<AnalyzeTokenForm>({
    resolver: zodResolver(analyzeTokenSchema),
    defaultValues: {
      chain: '',
      tokenAddress: '',
    },
  });

  const watchedChain = watch('chain');

  // Load supported chains on mount
  useEffect(() => {
    if (supportedChains.length === 0) {
      fetchSupportedChains();
    }
  }, [supportedChains.length, fetchSupportedChains]);

  // Update selected chain when form value changes
  useEffect(() => {
    setSelectedChain(watchedChain);
  }, [watchedChain]);

  const onSubmit = async (data: AnalyzeTokenForm) => {
    clearError();

    // Validate address format for selected chain
    const pattern = ADDRESS_PATTERNS[data.chain as keyof typeof ADDRESS_PATTERNS];
    if (pattern && !pattern.test(data.tokenAddress.trim())) {
      const chainName = supportedChains.find((c) => c.id === data.chain)?.name || data.chain;
      setError('tokenAddress', {
        type: 'manual',
        message: `Invalid ${chainName} address format`,
      });
      return;
    }

    try {
      await analyzeToken(data.chain, data.tokenAddress.trim());
      toast.success('Token analysis completed!');
    } catch (error) {
      toast.error('Failed to analyze token. Please try again.');
      console.error('Analysis error:', error);
    }
  };

  const getChainIcon = (chainId: string) => {
    const icons: Record<string, string> = {
      ethereum: '⟠',
      solana: '◎',
      bsc: '🔶',
      polygon: '🟣',
      base: '🔵',
      avalanche: '🔺',
    };
    return icons[chainId] || '🔗';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analyze Token</h1>
        <p className="mt-2 text-gray-600">
          Get comprehensive security analysis and risk assessment for any token
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Token</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Chain Selection */}
            <div>
              <label htmlFor="chain" className="block text-sm font-medium text-gray-700 mb-2">
                Blockchain Network
              </label>
              <select
                id="chain"
                {...register('chain')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.chain ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isAnalyzing || supportedChains.length === 0}
              >
                <option value="">Select a blockchain...</option>
                {supportedChains.map((chain) => (
                  <option key={chain.id} value={chain.id}>
                    {getChainIcon(chain.id)} {chain.name}
                  </option>
                ))}
              </select>
              {errors.chain && <p className="mt-1 text-sm text-red-600">{errors.chain.message}</p>}

              {/* Chain info */}
              {selectedChain && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Selected:</span>{' '}
                    {supportedChains.find((c) => c.id === selectedChain)?.name}
                    <span className="mx-2">•</span>
                    <span className="font-semibold">Native Token:</span>{' '}
                    {supportedChains.find((c) => c.id === selectedChain)?.nativeToken}
                  </p>
                </div>
              )}
            </div>

            {/* Token Address Input */}
            <div>
              <Input
                label="Token Contract Address"
                placeholder={
                  selectedChain === 'solana'
                    ? 'e.g., EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
                    : 'e.g., 0x...'
                }
                {...register('tokenAddress')}
                error={errors.tokenAddress?.message}
                disabled={isAnalyzing}
                autoComplete="off"
              />
              {selectedChain && (
                <p className="mt-1 text-xs text-gray-500">
                  Enter the token contract address on{' '}
                  {supportedChains.find((c) => c.id === selectedChain)?.name}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isAnalyzing}
              disabled={isAnalyzing || !selectedChain}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Token'}
            </Button>
          </form>
        </div>
      </Card>

      {/* Loading State */}
      {isAnalyzing && (
        <Card>
          <div className="p-12 text-center">
            <Spinner size="xl" className="mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Token...</h3>
            <p className="text-gray-600">
              Gathering data from multiple sources and calculating risk score
            </p>
          </div>
        </Card>
      )}

      {/* Analysis Results */}
      {currentAnalysis && !isAnalyzing && (
        <AnalysisResults
          analysis={currentAnalysis}
          chains={supportedChains}
          onCopyAddress={() => {
            navigator.clipboard.writeText(currentAnalysis.token_address);
            toast.success('Address copied!');
          }}
        />
      )}

      {/* No Results State */}
      {!currentAnalysis && !isAnalyzing && (
        <Card>
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Yet</h3>
            <p className="text-gray-600">Enter a token address above to get started</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AnalyzeToken;
