// Модуль для экспорта смет в PDF
class PDFExporter {
    constructor(app) {
        this.app = app;
    }

    // Экспорт сметы в PDF
    async exportEstimateToPDF(estimateId) {
        try {
            const response = await fetch(`/api/estimate/${estimateId}/pdf`);
            if (response.ok) {
                const data = await response.json();
                this.generatePDF(data.estimate, data.items);
            } else {
                const error = await response.json();
                this.app.showAlert(error.error || 'Ошибка получения данных сметы', 'danger');
            }
        } catch (error) {
            console.error('Ошибка экспорта PDF:', error);
            this.app.showAlert('Ошибка соединения с сервером', 'danger');
        }
    }

    // Генерация PDF документа
    generatePDF(estimate, items) {
        // Создаем HTML для PDF
        const htmlContent = this.createEstimateHTML(estimate, items);
        
        // Создаем временный элемент для рендеринга
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        document.body.appendChild(tempDiv);

        // Используем html2canvas для конвертации в изображение
        html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            allowTaint: true
        }).then(canvas => {
            // Создаем PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Скачиваем PDF
            const fileName = `estimate_${estimate.estimate_number}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

            // Удаляем временный элемент
            document.body.removeChild(tempDiv);
        }).catch(error => {
            console.error('Ошибка генерации PDF:', error);
            this.app.showAlert('Ошибка генерации PDF', 'danger');
            document.body.removeChild(tempDiv);
        });
    }

    // Создание HTML для сметы
    createEstimateHTML(estimate, items) {
        const currentDate = new Date().toLocaleDateString('ru-RU');
        
        return `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: white;">
                <!-- Заголовок -->
                <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
                    <h1 style="color: #333; margin: 0; font-size: 24px;">СМЕТА № ${estimate.estimate_number}</h1>
                    <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">от ${currentDate}</p>
                </div>

                <!-- Информация о клиенте -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Информация о клиенте</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold; width: 30%;">Клиент:</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${estimate.client_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Телефон:</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${estimate.client_phone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9; font-weight: bold;">Адрес:</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${estimate.address}</td>
                        </tr>
                    </table>
                </div>

                <!-- Позиции сметы -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Позиции сметы</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 12px; border: 1px solid #ddd; text-align: left; font-weight: bold;">№</th>
                                <th style="padding: 12px; border: 1px solid #ddd; text-align: left; font-weight: bold;">Наименование</th>
                                <th style="padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold;">Кол-во</th>
                                <th style="padding: 12px; border: 1px solid #ddd; text-align: center; font-weight: bold;">Ед.изм.</th>
                                <th style="padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold;">Цена за ед.</th>
                                <th style="padding: 12px; border: 1px solid #ddd; text-align: right; font-weight: bold;">Сумма</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.generateEstimateItemsRows(items)}
                        </tbody>
                    </table>
                </div>

                <!-- Итоги -->
                <div style="margin-top: 30px; border-top: 2px solid #333; padding-top: 20px;">
                    <div style="display: flex; justify-content: flex-end;">
                        <div style="width: 300px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 16px;">
                                <span><strong>Итого:</strong></span>
                                <span><strong>${estimate.total_amount.toLocaleString('ru-RU')} ₽</strong></span>
                            </div>
                            ${estimate.discount_percent > 0 || estimate.discount_amount > 0 ? `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 16px; color: #dc3545;">
                                    <span><strong>Скидка:</strong></span>
                                    <span><strong>-${(estimate.discount_percent > 0 ? (estimate.total_amount * estimate.discount_percent / 100) : estimate.discount_amount).toLocaleString('ru-RU')} ₽</strong></span>
                                </div>
                            ` : ''}
                            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #333; border-top: 1px solid #333; padding-top: 10px;">
                                <span>К доплате:</span>
                                <span>${estimate.final_amount.toLocaleString('ru-RU')} ₽</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Подпись -->
                <div style="margin-top: 50px; text-align: center;">
                    <p style="margin: 20px 0 5px 0; font-size: 14px;">Смета составлена: ${currentDate}</p>
                    <p style="margin: 0; font-size: 14px; color: #666;">Система управления заказами "Оконные Мастера"</p>
                </div>
            </div>
        `;
    }

    // Генерация строк таблицы позиций сметы
    generateEstimateItemsRows(items) {
        let html = '';
        let itemNumber = 1;

        // Группируем по категориям
        const categories = {
            'mosquito': 'Москитные системы и плиссе',
            'blinds': 'Рулонные шторы',
            'repair': 'Ремонт'
        };

        Object.keys(categories).forEach(category => {
            const categoryItems = items.filter(item => item.category === category);
            if (categoryItems.length > 0) {
                html += `
                    <tr>
                        <td colspan="6" style="padding: 10px; background: #e9ecef; font-weight: bold; text-align: center;">
                            ${categories[category]}
                        </td>
                    </tr>
                `;
                
                categoryItems.forEach(item => {
                    html += `
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${itemNumber++}</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">${item.item_name}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.unit_type}</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.unit_price.toLocaleString('ru-RU')} ₽</td>
                            <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${(item.quantity * item.unit_price).toLocaleString('ru-RU')} ₽</td>
                        </tr>
                    `;
                });
            }
        });

        return html;
    }
}

// Создаем глобальный экземпляр после инициализации app
let pdfExporter;

// Инициализируем после загрузки app
function initPDFExporter() {
    if (window.app) {
        pdfExporter = new PDFExporter(window.app);
    } else {
        // Ждем инициализации app
        setTimeout(initPDFExporter, 100);
    }
}

// Запускаем инициализацию
initPDFExporter();
