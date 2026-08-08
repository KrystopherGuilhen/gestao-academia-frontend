export interface MultiSelectOptions {
    filter?: boolean; // Habilita filtro
    selectedItemsLabel?: string; // Texto exibido quando opções estão selecionadas
    showHeader?: boolean; // Exibir ou não cabeçalho
    panelStyleClass?: string; // Classe de estilo para o painel
    display?: 'comma' | 'chip'; // Como os itens selecionados são exibidos
    optionLabel?: string; // Nome do atributo usado como label
    optionValue?: string; // Nome do atributo usado como valor
    maxSelectedLabels?: number; // Número máximo de labels a serem exibidas antes de "e mais..."
    defaultLabel?: string; // Placeholder padrão
    showClear?: boolean; // Mostrar botão para limpar seleção
    scrollHeight?: string; // Altura máxima do painel
}
