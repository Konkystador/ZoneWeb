// Estimate Modal Management
let currentEstimate = null;
let currentOrder = null;
let services = [];
let estimateItems = [];

// Initialize estimate modal
function initEstimateModal() {
    console.log('🔧 Инициализация модального окна смет');
    loadServices();
}

// Load services for estimate items
async function loadServices() {
    try {
        const response = await fetch('/api/services');
        if (response.ok) {
            services = await response.json();
            console.log('✅ Услуги загружены:', services.length);
        } else {
            console.error('❌ Ошибка загрузки услуг');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки услуг:', error);
    }
}

// Open estimate modal for creating new estimate
function openEstimateModal(orderId) {
    console.log('🔧 Открытие модального окна сметы для заказа:', orderId);
    
    // Reset modal
    currentEstimate = null;
    estimateItems = [];
    
    // Load order data
    loadOrderForEstimate(orderId);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('estimateModal'));
    modal.show();
}

// Load order data for estimate
async function loadOrderForEstimate(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (response.ok) {
            currentOrder = await response.json();
            populateOrderInfo();
            updateEstimateModalTitle('Создание сметы');
            resetEstimateForm();
        } else {
            showAlert('Ошибка загрузки заказа', 'danger');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки заказа:', error);
        showAlert('Ошибка загрузки заказа', 'danger');
    }
}

// Populate order information in modal
function populateOrderInfo() {
    if (!currentOrder) return;
    
    document.getElementById('estimateOrderNumber').textContent = currentOrder.order_number || '-';
    document.getElementById('estimateClientName').textContent = currentOrder.client_name || '-';
    document.getElementById('estimateClientPhone').textContent = currentOrder.client_phone || '-';
    document.getElementById('estimateClientAddress').textContent = currentOrder.address || '-';
    document.getElementById('estimateProblem').textContent = currentOrder.problem_description || '-';
}

// Update modal title
function updateEstimateModalTitle(title) {
    document.getElementById('estimateModalTitle').textContent = title;
}

// Reset estimate form
function resetEstimateForm() {
    estimateItems = [];
    document.getElementById('estimateItemsBody').innerHTML = '';
    document.getElementById('estimateTotalAmount').textContent = '0';
    document.getElementById('estimateNotes').value = '';
    
    // Hide history section
    document.getElementById('estimateHistorySection').style.display = 'none';
    document.getElementById('estimateHistoryBtn').style.display = 'none';
    document.getElementById('estimateApproveBtn').style.display = 'none';
    document.getElementById('estimateExportBtn').style.display = 'none';
    
    // Add first empty item
    addEstimateItem();
}

// Add new estimate item
function addEstimateItem() {
    const itemId = Date.now();
    const item = {
        id: itemId,
        service_id: '',
        quantity: 1,
        unit_price: 0,
        notes: ''
    };
    
    estimateItems.push(item);
    renderEstimateItems();
}

// Remove estimate item
function removeEstimateItem(itemId) {
    estimateItems = estimateItems.filter(item => item.id !== itemId);
    renderEstimateItems();
    calculateTotal();
}

// Render estimate items table
function renderEstimateItems() {
    const tbody = document.getElementById('estimateItemsBody');
    tbody.innerHTML = '';
    
    estimateItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <select class="form-select form-select-sm" onchange="updateEstimateItem(${item.id}, 'service_id', this.value)">
                    <option value="">Выберите услугу</option>
                    ${services.map(service => 
                        `<option value="${service.id}" ${item.service_id == service.id ? 'selected' : ''}>${service.name}</option>`
                    ).join('')}
                </select>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm" value="${item.quantity}" 
                       onchange="updateEstimateItem(${item.id}, 'quantity', this.value)" min="0" step="0.01">
            </td>
            <td>
                <span class="unit-type">${getServiceUnitType(item.service_id)}</span>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm" value="${item.unit_price}" 
                       onchange="updateEstimateItem(${item.id}, 'unit_price', this.value)" min="0" step="0.01">
            </td>
            <td>
                <span class="item-total">${(item.quantity * item.unit_price).toFixed(2)}</span>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm" value="${item.notes}" 
                       onchange="updateEstimateItem(${item.id}, 'notes', this.value)" placeholder="Примечание">
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeEstimateItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Get service unit type
function getServiceUnitType(serviceId) {
    const service = services.find(s => s.id == serviceId);
    return service ? service.unit_type : '-';
}

// Update estimate item
function updateEstimateItem(itemId, field, value) {
    const item = estimateItems.find(i => i.id === itemId);
    if (item) {
        if (field === 'quantity' || field === 'unit_price') {
            item[field] = parseFloat(value) || 0;
        } else {
            item[field] = value;
        }
        
        // Update unit type if service changed
        if (field === 'service_id') {
            const row = event.target.closest('tr');
            const unitTypeSpan = row.querySelector('.unit-type');
            unitTypeSpan.textContent = getServiceUnitType(value);
            
            // Set default price from service
            const service = services.find(s => s.id == value);
            if (service) {
                item.unit_price = service.base_price;
                const priceInput = row.querySelector('input[type="number"]:nth-of-type(2)');
                priceInput.value = service.base_price;
            }
        }
        
        // Update item total
        const row = event.target.closest('tr');
        const totalSpan = row.querySelector('.item-total');
        totalSpan.textContent = (item.quantity * item.unit_price).toFixed(2);
        
        calculateTotal();
    }
}

// Calculate total amount
function calculateTotal() {
    const total = estimateItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    document.getElementById('estimateTotalAmount').textContent = total.toFixed(2);
}

// Save estimate
async function saveEstimate() {
    if (!currentOrder) {
        showAlert('Ошибка: заказ не загружен', 'danger');
        return;
    }
    
    // Validate items
    const validItems = estimateItems.filter(item => item.service_id && item.quantity > 0);
    if (validItems.length === 0) {
        showAlert('Добавьте хотя бы одну позицию в смету', 'warning');
        return;
    }
    
    const estimateData = {
        order_id: currentOrder.id,
        items: validItems,
        notes: document.getElementById('estimateNotes').value
    };
    
    try {
        const url = currentEstimate ? `/api/estimates/${currentEstimate.id}` : '/api/estimates';
        const method = currentEstimate ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(estimateData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showAlert(result.message || 'Смета сохранена', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('estimateModal'));
            modal.hide();
            
            // Refresh estimates page if we're on it
            if (window.app && window.app.currentPage === 'estimates') {
                window.app.loadEstimates();
            }
        } else {
            const error = await response.json();
            showAlert(error.error || 'Ошибка сохранения сметы', 'danger');
        }
    } catch (error) {
        console.error('❌ Ошибка сохранения сметы:', error);
        showAlert('Ошибка сохранения сметы', 'danger');
    }
}

// Approve estimate
async function approveEstimate() {
    if (!currentEstimate) return;
    
    try {
        const response = await fetch(`/api/estimates/${currentEstimate.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'approved' })
        });
        
        if (response.ok) {
            showAlert('Смета утверждена', 'success');
            loadEstimateHistory();
        } else {
            const error = await response.json();
            showAlert(error.error || 'Ошибка утверждения сметы', 'danger');
        }
    } catch (error) {
        console.error('❌ Ошибка утверждения сметы:', error);
        showAlert('Ошибка утверждения сметы', 'danger');
    }
}

// Toggle estimate history
function toggleEstimateHistory() {
    const section = document.getElementById('estimateHistorySection');
    const isVisible = section.style.display !== 'none';
    
    if (isVisible) {
        section.style.display = 'none';
    } else {
        section.style.display = 'block';
        if (currentEstimate) {
            loadEstimateHistory();
        }
    }
}

// Load estimate history
async function loadEstimateHistory() {
    if (!currentEstimate) return;
    
    try {
        const response = await fetch(`/api/estimates/${currentEstimate.id}/history`);
        if (response.ok) {
            const history = await response.json();
            renderEstimateHistory(history);
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки истории сметы:', error);
    }
}

// Render estimate history
function renderEstimateHistory(history) {
    const tbody = document.getElementById('estimateHistoryBody');
    tbody.innerHTML = '';
    
    history.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(record.changed_at).toLocaleString()}</td>
            <td>${record.action}</td>
            <td>${record.changed_by_name || 'Система'}</td>
            <td>${record.new_value || '-'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Export estimate to PDF
function exportEstimateToPDF() {
    if (!currentEstimate) return;
    
    // This would integrate with existing PDF export functionality
    showAlert('Экспорт в PDF будет реализован', 'info');
}

// Add estimate button to order cards
function addEstimateButtonToOrderCard(orderId, orderStatus) {
    if (orderStatus === 'in_progress') {
        return `
            <button class="btn btn-sm btn-warning" onclick="openEstimateModal(${orderId})" title="Работать со сметой">
                <i class="fas fa-calculator"></i> Смета
            </button>
        `;
    }
    return '';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initEstimateModal();
});

// Make functions globally available
window.openEstimateModal = openEstimateModal;
window.addEstimateItem = addEstimateItem;
window.removeEstimateItem = removeEstimateItem;
window.updateEstimateItem = updateEstimateItem;
window.saveEstimate = saveEstimate;
window.approveEstimate = approveEstimate;
window.toggleEstimateHistory = toggleEstimateHistory;
window.exportEstimateToPDF = exportEstimateToPDF;
window.addEstimateButtonToOrderCard = addEstimateButtonToOrderCard;
