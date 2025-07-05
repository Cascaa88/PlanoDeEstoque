document.addEventListener('DOMContentLoaded', () => {
    const materialNameSelect = document.getElementById('materialName');
    const materialQuantityInput = document.getElementById('materialQuantity');
    const materialMinStockInput = document.getElementById('materialMinStock');
    const addMaterialBtn = document.getElementById('addMaterialBtn');
    const inventoryTableBody = document.querySelector('#inventoryTable tbody');

    // Carrega o inventário do Local Storage ou inicia com uma lista vazia
    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

    // Produtos predefinidos para popular o select se o inventário estiver vazio
    const predefinedProducts = [
        "Arroz (5kg)", "Feijão Carioca (1kg)", "Óleo de Soja (900ml)",
        "Azeite Extra Virgem (500ml)", "Molho de Tomate (340g)",
        "Macarrão Espaguete (500g)", "Café em Pó (500g)",
        "Açúcar Refinado (1kg)", "Leite Longa Vida (1L)",
        "Farinha de Trigo (1kg)"
    ];

    // Preenche o select com os produtos predefinidos
    function populateProductSelect() {
        // Isso já é feito no HTML, mas poderíamos adicionar mais dinamicamente aqui se necessário.
        // O principal é garantir que o valor selecionado seja usado corretamente.
    }

    // Função para renderizar a tabela de inventário
    function renderInventory() {
        inventoryTableBody.innerHTML = ''; // Limpa as linhas existentes

        if (inventory.length === 0) {
            const noMaterialsRow = document.createElement('tr');
            noMaterialsRow.innerHTML = `<td colspan="5" style="text-align: center; padding: 20px;">Nenhum material cadastrado ainda. Use o formulário acima para adicionar.</td>`;
            inventoryTableBody.appendChild(noMaterialsRow);
            return;
        }

        inventory.forEach((material, index) => {
            const row = document.createElement('tr');
            const neededForPurchase = Math.max(0, material.minStock - material.quantity);
            const statusClass = neededForPurchase > 0 ? 'status-reorder' : 'status-ok';
            const statusText = neededForPurchase > 0 ? `Comprar ${neededForPurchase} unidades` : 'Estoque OK';

            row.innerHTML = `
                <td>${material.name}</td>
                <td>${material.quantity}</td>
                <td>${material.minStock}</td>
                <td class="${statusClass}">${statusText}</td>
                <td>
                    <button class="action-btn edit" data-index="${index}">Editar</button>
                    <button class="action-btn delete" data-index="${index}">Remover</button>
                </td>
            `;
            inventoryTableBody.appendChild(row);
        });
    }

    // Função para salvar o inventário no Local Storage
    function saveInventory() {
        localStorage.setItem('inventory', JSON.stringify(inventory));
    }

    // Adicionar ou Atualizar Material
    addMaterialBtn.addEventListener('click', () => {
        const name = materialNameSelect.value.trim();
        const quantity = parseInt(materialQuantityInput.value);
        const minStock = parseInt(materialMinStockInput.value);

        if (!name || name === "" || isNaN(quantity) || isNaN(minStock) || quantity < 0 || minStock < 0) {
            alert('Por favor, selecione um material e preencha todos os campos corretamente (quantidade e estoque mínimo devem ser números positivos).');
            return;
        }

        const existingMaterialIndex = inventory.findIndex(m => m.name.toLowerCase() === name.toLowerCase());

        if (existingMaterialIndex > -1) {
            // Atualiza material existente
            inventory[existingMaterialIndex].quantity = quantity;
            inventory[existingMaterialIndex].minStock = minStock;
            alert(`Material "${name}" atualizado com sucesso!`);
        } else {
            // Adiciona novo material
            inventory.push({ name, quantity, minStock });
            alert(`Material "${name}" adicionado com sucesso!`);
        }

        // Limpa os campos de input após adicionar/atualizar
        materialNameSelect.value = ''; // Reseta para a opção padrão
        materialQuantityInput.value = '';
        materialMinStockInput.value = '';
        saveInventory();
        renderInventory();
    });

    // Editar e Remover Material
    inventoryTableBody.addEventListener('click', (event) => {
        const target = event.target;
        // Certifica-se de que estamos clicando em um botão com data-index
        if (target.classList.contains('action-btn') && target.dataset.index) {
            const index = parseInt(target.dataset.index); // Converte para número

            if (target.classList.contains('delete')) {
                if (confirm(`Tem certeza que deseja remover "${inventory[index].name}" do estoque?`)) {
                    inventory.splice(index, 1);
                    saveInventory();
                    renderInventory();
                }
            } else if (target.classList.contains('edit')) {
                const materialToEdit = inventory[index];
                materialNameSelect.value = materialToEdit.name;
                materialQuantityInput.value = materialToEdit.quantity;
                materialMinStockInput.value = materialToEdit.minStock;
                // Ao editar, o usuário pode então clicar em "Adicionar/Atualizar" novamente para salvar as mudanças.
            }
        }
    });

    // Renderização inicial ao carregar a página
    populateProductSelect(); // Embora os produtos já estejam no HTML, se quisesse adicionar mais via JS, faria aqui.
    renderInventory();
});