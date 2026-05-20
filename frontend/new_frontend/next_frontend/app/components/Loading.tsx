export default function Loading(){
    return(
        <div className="fixed inset-0 w-screen h-screen bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
        
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>

        <div className="text-center">
            <p className="text-lg font-semibold text-gray-800">
            Processing...
            </p>

            <p className="text-sm text-gray-500 mt-1">
            Please wait a moment
            </p>
        </div>

        </div>
    </div>
    );
}