export interface UploadEvent {
    originalEvent: Event;
    files: File[];
}

export interface MyFile extends File {
    name: string;      // Nome do arquivo
    type: string;      // Tipo MIME (ex: "image/png")
    objectURL?: string; // URL temporária (apenas para novos arquivos)
    base64?: string;   // Base64 (para arquivos já persistidos)g;
}