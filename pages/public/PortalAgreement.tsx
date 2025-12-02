
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button, Card, Logo } from '../../components/Components';

export const PortalAgreement: React.FC = () => {
  const { candidates, markAgreementAccepted, isCloudEnabled } = useApp();
  const { id } = useParams<{ id: string }>();
  const [isAccepted, setIsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const candidate = candidates.find(c => c.id === id);

  useEffect(() => {
    if (candidate?.agreementAcceptedDate) {
      setIsAccepted(true);
    }
  }, [candidate]);

  const handleAccept = () => {
    if (id && candidate) {
      if (!isCloudEnabled) {
          setError("The system is currently in Offline Mode. Acceptance cannot be recorded. Please contact admin.");
          return;
      }
      try {
        markAgreementAccepted(id);
        setIsAccepted(true);
      } catch (e) {
        setError("Failed to record acceptance. Please try again.");
      }
    }
  };

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
            <h1 className="text-xl font-bold text-gray-400">Loading Agreement...</h1>
            <p className="text-sm text-gray-500 mt-2">If this takes too long, the link may be invalid or the system is offline.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
                <Logo size="lg" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Training Candidature Agreement</h1>
            <p className="text-gray-600">SPR Techforge Pvt Ltd</p>
        </div>

        {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded text-red-700">
                {error}
            </div>
        )}

        <Card className="mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                <h3 className="text-sm font-bold text-blue-800 uppercase mb-2">Candidate Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Name:</span> <span className="font-bold text-gray-900">{candidate.name}</span></div>
                    <div><span className="text-gray-500">Batch ID:</span> <span className="font-bold text-gray-900">{candidate.batchId}</span></div>
                    <div><span className="text-gray-500">Email:</span> <span className="text-gray-900">{candidate.email}</span></div>
                    <div><span className="text-gray-500">Phone:</span> <span className="text-gray-900">{candidate.phone}</span></div>
                </div>
            </div>

            <div className="prose max-w-none border-t border-b border-gray-100 py-6 my-6">
                 <div className="whitespace-pre-wrap font-serif text-justify leading-relaxed text-gray-800">
                     {candidate.agreementText || "Agreement text not available."}
                 </div>
            </div>

            <div className="flex flex-col items-center gap-4 mt-8">
                {isAccepted ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center w-full">
                        <svg className="w-16 h-16 text-emerald-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-xl font-bold text-emerald-800">Agreement Accepted</h2>
                        <p className="text-emerald-600 text-sm mt-1">
                            Recorded on {new Date(candidate.agreementAcceptedDate!).toLocaleString()}
                        </p>
                        <p className="text-gray-500 text-xs mt-4">You may close this window.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start gap-3 bg-amber-50 p-4 rounded text-sm text-amber-800">
                            <input type="checkbox" className="mt-1 w-5 h-5 accent-amber-600" id="consent" />
                            <label htmlFor="consent">
                                I, <strong>{candidate.name}</strong>, have read and understood the terms and conditions mentioned above. 
                                By clicking "Accept", I agree to abide by the rules and regulations of SPR Techforge Pvt Ltd.
                            </label>
                        </div>
                        <Button 
                            className="w-full md:w-auto px-12 py-3 text-lg" 
                            onClick={() => {
                                const cb = document.getElementById('consent') as HTMLInputElement;
                                if (cb && cb.checked) {
                                    handleAccept();
                                } else {
                                    alert("Please check the box to confirm you have read the agreement.");
                                }
                            }}
                        >
                            I Accept & Sign
                        </Button>
                    </>
                )}
            </div>
        </Card>
        
        <div className="text-center text-xs text-gray-400 mt-8 pb-8">
            &copy; 2025 SPR Techforge Pvt Ltd. All rights reserved.
        </div>
      </div>
    </div>
  );
};
