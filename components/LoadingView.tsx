import React from 'react';

const LoadingView: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[10000]">
            <div 
                className="w-[50px] h-[50px] border-4 border-[#222] border-t-[#CCFF00] rounded-full animate-spin mb-5"
                style={{ animationDuration: '0.8s' }}
            ></div>
            
            <div className="font-raj font-bold text-[#CCFF00] tracking-[2px] animate-pulse">
                AUTHENTICATING...
            </div>
            
            {/* Embedded styles for specific animations if they aren't in index.html */}
            <style>{`
                @keyframes spin { 
                    0% { transform: rotate(0deg); } 
                    100% { transform: rotate(360deg); } 
                }
                @keyframes pulse { 
                    0% { opacity: 0.6; } 
                    50% { opacity: 1; } 
                    100% { opacity: 0.6; } 
                }
            `}</style>
        </div>
    );
};

export default LoadingView;