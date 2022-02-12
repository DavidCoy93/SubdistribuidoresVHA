import { MatPaginatorIntl } from "@angular/material/paginator";

export class MatPaginatorIntlSpanish extends MatPaginatorIntl {

    override itemsPerPageLabel: string = 'Articulos por página';
    override nextPageLabel: string = 'Siguiente';
    override previousPageLabel: string = 'Anterior';
    override firstPageLabel: string = 'Primera página';
    override lastPageLabel: string = 'Última página';
    override getRangeLabel = (page: number, pageSize: number, length: number): string => {

        if (length === 0) {
            return `0 de ${length}`;
        }

        length = Math.max(length, 0);

        const startIndex = page * pageSize;

        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

        return `${startIndex + 1} - ${endIndex} de ${length}`;
    }
}
