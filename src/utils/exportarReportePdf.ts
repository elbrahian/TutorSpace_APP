import type { jsPDF } from 'jspdf'
import type { UserOptions } from 'jspdf-autotable'

type AlineacionPdf = 'left' | 'center' | 'right'
type OrientacionPdf = 'portrait' | 'landscape'
type CeldaReportePdf = string | number | null | undefined

export interface ColumnaReportePdf {
    header: string
    align?: AlineacionPdf
}

export interface ExportarReportePdfOptions {
    title: string
    fileName: string
    columns: ColumnaReportePdf[]
    rows: CeldaReportePdf[][]
    subtitle?: string
    metadata?: string[]
    orientation?: OrientacionPdf
    preview?: boolean
}

const colores = {
    primary: [37, 99, 235] as [number, number, number],
    slate900: [15, 23, 42] as [number, number, number],
    slate700: [51, 65, 85] as [number, number, number],
    slate500: [100, 116, 139] as [number, number, number],
    slate200: [226, 232, 240] as [number, number, number],
    slate100: [241, 245, 249] as [number, number, number],
    slate50: [248, 250, 252] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
}

const margenHorizontal = 40
const margenInferior = 48

const fechaGeneracion = () => new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
}).format(new Date())

const normalizarCelda = (valor: CeldaReportePdf) => {
    if (valor === null || valor === undefined || valor === '') return 'Sin datos'
    return String(valor)
}

const escaparHtml = (valor: string) => valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const columnStyles = (columns: ColumnaReportePdf[]) => {
    return columns.reduce<NonNullable<UserOptions['columnStyles']>>((styles, column, index) => {
        if (column.align) styles[index] = { halign: column.align }
        return styles
    }, {})
}

const abrirVistaPrevia = (previewWindow: Window, url: string, fileName: string) => {
    const titulo = escaparHtml(fileName.replace(/\.pdf$/i, ''))

    previewWindow.document.open()
    previewWindow.document.write(`
        <!doctype html>
        <html lang="es">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>${titulo}</title>
                <style>
                    body {
                        margin: 0;
                        font-family: Arial, sans-serif;
                        background: #0f172a;
                        color: #f8fafc;
                    }
                    header {
                        height: 56px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 16px;
                        padding: 0 20px;
                        background: #020617;
                        border-bottom: 1px solid #1e293b;
                    }
                    h1 {
                        margin: 0;
                        font-size: 15px;
                        font-weight: 700;
                    }
                    a {
                        display: inline-flex;
                        align-items: center;
                        border-radius: 8px;
                        padding: 10px 14px;
                        background: #2563eb;
                        color: #ffffff;
                        font-size: 14px;
                        font-weight: 700;
                        text-decoration: none;
                    }
                    iframe {
                        width: 100%;
                        height: calc(100vh - 57px);
                        border: 0;
                        background: #ffffff;
                    }
                </style>
            </head>
            <body>
                <header>
                    <h1>${titulo}</h1>
                    <a href="${url}" download="${escaparHtml(fileName)}">Descargar PDF</a>
                </header>
                <iframe src="${url}#toolbar=0"></iframe>
            </body>
        </html>
    `)
    previewWindow.document.close()
}

const drawHeader = (doc: jsPDF, title: string, lines: string[], tableStartY: number) => {
    const pageWidth = doc.internal.pageSize.getWidth()

    doc.setFillColor(...colores.primary)
    doc.rect(0, 0, pageWidth, 8, 'F')
    doc.setTextColor(...colores.slate900)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(17)
    doc.text(title, margenHorizontal, 38)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...colores.primary)
    doc.text('TutorSpace', pageWidth - margenHorizontal, 38, { align: 'right' })
    doc.setDrawColor(...colores.slate200)
    doc.setLineWidth(0.7)
    doc.line(margenHorizontal, 54, pageWidth - margenHorizontal, 54)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...colores.slate500)
    lines.forEach((line, index) => {
        doc.text(line, margenHorizontal, 72 + index * 13)
    })
    doc.setDrawColor(...colores.slate100)
    doc.line(margenHorizontal, tableStartY - 16, pageWidth - margenHorizontal, tableStartY - 16)
}

const drawFooter = (doc: jsPDF, page: number, totalPages: number) => {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const footerY = pageHeight - 24

    doc.setDrawColor(...colores.slate200)
    doc.setLineWidth(0.5)
    doc.line(margenHorizontal, pageHeight - 38, pageWidth - margenHorizontal, pageHeight - 38)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...colores.slate500)
    doc.text('TutorSpace', margenHorizontal, footerY)
    doc.text(`Página ${page} de ${totalPages}`, pageWidth - margenHorizontal, footerY, { align: 'right' })
}

export const exportarReportePdf = async ({
    title,
    subtitle,
    fileName,
    columns,
    rows,
    metadata = [],
    orientation = 'landscape',
    preview = true,
}: ExportarReportePdfOptions) => {
    const previewWindow = preview && typeof window !== 'undefined'
        ? window.open('', '_blank')
        : null
    try {
        const [{ jsPDF }, { default: autoTable }] = await Promise.all([
            import('jspdf'),
            import('jspdf-autotable'),
        ])
        const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' })
        const metadataLines = [
            ...(subtitle ? [subtitle] : []),
            `Generado: ${fechaGeneracion()}`,
            ...metadata,
        ]
        const tableStartY = Math.max(112, 86 + metadataLines.length * 13)
        const body = rows.map((row) => row.map(normalizarCelda))

        autoTable(doc, {
            startY: tableStartY,
            head: [columns.map((column) => column.header)],
            body,
            theme: 'grid',
            margin: {
                top: tableStartY,
                right: margenHorizontal,
                bottom: margenInferior,
                left: margenHorizontal,
            },
            styles: {
                font: 'helvetica',
                fontSize: 9,
                cellPadding: 6,
                textColor: colores.slate700,
                lineColor: colores.slate200,
                lineWidth: 0.5,
                overflow: 'linebreak',
            },
            headStyles: {
                fillColor: colores.primary,
                textColor: colores.white,
                fontStyle: 'bold',
                halign: 'left',
            },
            alternateRowStyles: {
                fillColor: colores.slate50,
            },
            columnStyles: columnStyles(columns),
        })

        const totalPages = doc.getNumberOfPages()
        for (let page = 1; page <= totalPages; page += 1) {
            doc.setPage(page)
            drawHeader(doc, title, metadataLines, tableStartY)
            drawFooter(doc, page, totalPages)
        }

        const blob = doc.output('blob')
        const url = URL.createObjectURL(blob)

        if (previewWindow) {
            abrirVistaPrevia(previewWindow, url, fileName)
        } else {
            const link = document.createElement('a')
            link.href = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }

        setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (error) {
        previewWindow?.close()
        throw error
    }
}
