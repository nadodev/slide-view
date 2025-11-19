export function PresentationShowHelp({ setShowHelp }: { setShowHelp: (show: boolean) => void }) {
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50"
            onClick={() => setShowHelp(false)}
        >
            <div
                className="bg-white rounded-lg p-8 max-w-lg w-11/12 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-primary-1 text-xl font-semibold">
                    Atalhos de Teclado
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-white border rounded">→</kbd>{" "}
                            <kbd className="px-2 py-1 bg-white border rounded">Space</kbd>
                        </div>
                        <span className="text-sm text-gray-600">Próximo slide</span>
                    </div>
                    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                        <kbd className="px-2 py-1 bg-white border rounded">←</kbd>
                        <span className="text-sm text-gray-600">Slide anterior</span>
                    </div>
                    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                        <kbd className="px-2 py-1 bg-white border rounded">Home</kbd>
                        <span className="text-sm text-gray-600">Primeiro slide</span>
                    </div>
                    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                        <kbd className="px-2 py-1 bg-white border rounded">End</kbd>
                        <span className="text-sm text-gray-600">Último slide</span>
                    </div>
                    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                        <kbd className="px-2 py-1 bg-white border rounded">E</kbd>
                        <span className="text-sm text-gray-600">
                            Editar slide atual
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-white border rounded">Ctrl</kbd>+
                            <kbd className="px-2 py-1 bg-white border rounded">D</kbd>
                        </div>
                        <span className="text-sm text-gray-600">Duplicar slide</span>
                    </div>
                    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                        <kbd className="px-2 py-1 bg-white border rounded">H</kbd>
                        <span className="text-sm text-gray-600">
                            Modo foco (sem chrome)
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                        <kbd className="px-2 py-1 bg-white border rounded">P</kbd>
                        <span className="text-sm text-gray-600">Modo apresentador</span>
                    </div>
                    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                        <kbd className="px-2 py-1 bg-white border rounded">F</kbd>
                        <span className="text-sm text-gray-600">Tela cheia</span>
                    </div>
                    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                        <kbd className="px-2 py-1 bg-white border rounded">?</kbd>
                        <span className="text-sm text-gray-600">
                            Mostrar/ocultar ajuda
                        </span>
                    </div>
                    <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-md">
                        <kbd className="px-2 py-1 bg-white border rounded">Esc</kbd>
                        <span className="text-sm text-gray-600">Fechar painéis</span>
                    </div>
                </div>
                <button
                    className="mt-6 w-full bg-linear-to-br from-primary-1 to-primary-2 text-white py-3 rounded-md font-semibold"
                    onClick={() => setShowHelp(false)}
                >
                    Fechar (Esc ou clique fora)
                </button>
            </div>
        </div>
    );
}