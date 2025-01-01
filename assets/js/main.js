const productsContainer = document.querySelector(".app__container-products__menu");
const orderContainer = document.querySelector(".app__container-order__list");

async function getProducts(){
    try {
        const data = await fetch('data.json');
        if(!data.ok){
            throw new Error(`Http error : ${data.status}`);
        }
        const fetchData = await data.json();
        fetchData.map((product)=>{
            productsContainer.innerHTML += `
            <div class='product'>
            <div class='product__container-image'>
            <picture>
            <source srcset='${product.image.tablet}' media='(min-width:768px)'>
            <source srcset='${product.image.mobile}' media='(max-width:550px)'>
            <img src='${product.image.desktop}' alt='${product.image.name}'>
            <source>
            </picture>
            <div class='product__actions'>
            <button id='${product.id}' onclick='AddToCart(this,${JSON.stringify(product)})'>
            <img src='./assets/images/icon-add-to-cart.svg'>
            <span>Add to Cart</span>
            </button>
            <div class='quantity'>
            <div class='increment' onclick='increment(${JSON.stringify(product)} , this)'>
            <img src='./assets/images/icon-increment-quantity.svg'>
            </div>
            <span>1</span>
            <div class='decrement' onclick='decrement(${JSON.stringify(product)} , this)'>
            <img src='./assets/images/icon-decrement-quantity.svg'>
            </div>
            </div>
            </div>
            </div>
            <div class='product__container-content'>
            <span>${product.category}</span>
            <h2>${product.name}</h2>
            <p>$${product.price.toFixed(2)}</p>
            </div>
            </div>
            `
            checkSelectedOrders(product);
        })
    }
    catch (err) {
        let errorMessage = document.createElement("h3");
        errorMessage.textContent = "No Products Founds"
        productsContainer.appendChild(errorMessage)
    }
}

function AddToCart(btn, product){
    const selectImgDiv = btn.parentElement.parentElement.querySelector('picture img');
    selectImgDiv.classList.add('selected');
    const quantityDiv = btn.nextElementSibling;
    quantityDiv.classList.add("show");
    btn.classList.add("hide");
    addOrder(product);
    renderOrders();
}

function increment(product , quantity){
    let quantityVal = quantity.parentElement.querySelector('span');
    const findProduct = findProductById(product.id);
    findProduct.find.quantity += 1;
    findProduct.find.totalPrice += findProduct.find.price;
    quantityVal.innerText = findProduct.find.quantity;
    updateLocalStorage(findProduct.orderList)
    renderOrders();
}
function decrement(product , quantity){
    let quantityVal = quantity.parentElement.querySelector('span');
    const findProduct = findProductById(product.id);
    if(findProduct.find.quantity <= 1){
        removeOrder(product.id);
        return ;
    }
    findProduct.find.quantity -= 1;
    findProduct.find.totalPrice -= findProduct.find.price;
    updateLocalStorage(findProduct.orderList)
    quantityVal.innerText = findProduct.find.quantity;
    renderOrders();
}

function addOrder(order){
    let orderDetails = {
        'id' : order.id ,
        'name' : order.name ,
        'image' : order.image.thumbnail,
        'price' : order.price ,
        }
    const findOrder = findProductById(orderDetails.id);
    if(findOrder.find){
        findOrder.find.quantity+=1;
        findOrder.find.totalPrice+= orderDetails.price;
    }
    else {
        orderDetails.quantity = 1;
        orderDetails.totalPrice = orderDetails.price;
        findOrder.orderList.push(orderDetails);
    }
    updateLocalStorage(findOrder.orderList);
};

function removeOrder(orderId){
    const quantityBtn = document.querySelectorAll('.product__container-image .product__actions .quantity');
    const parseCurrentOrder = findProductById(orderId);
    let targetOrderIndex = parseCurrentOrder.orderList.findIndex((e)=> e.id == +orderId);
    if(targetOrderIndex > -1){
        parseCurrentOrder.orderList.splice(targetOrderIndex , 1);
    }

    Array.from(quantityBtn , (e)=>{
        let cartBtn = e.previousElementSibling
        let qValue = e.querySelector('span');
        let selectedImg = e.parentElement.parentElement.querySelector("picture img");
    if(+cartBtn.id === +orderId){
        qValue.innerText = 1;
            e.classList.remove('show');
            cartBtn.classList.remove('hide');
            selectedImg.classList.remove("selected")
    }
});
updateLocalStorage(parseCurrentOrder.orderList);
renderOrders();
};

function renderOrders(){
const orderCounter = document.querySelector(".app__container-order h1 span");
let totalPrice = 0;
let totalQuantity = 0;
const currentOrders = JSON.parse(localStorage.getItem('cart')) || [];
if(currentOrders.length < 1){
    orderContainer.innerHTML = `
    <div class='app__container-order__list-empty'>
    <img src='./assets/images/illustration-empty-cart.svg'>
    <span>Your added items will appear here</span>
    </div>
    `
}

else {
    orderContainer.innerHTML = '';
    currentOrders.map((order)=>{
        totalPrice += order.totalPrice;
        totalQuantity += order.quantity;
        orderContainer.innerHTML += `
        <div class='order-box'>
        <h2>${order.name}</h2>
        <div class='orderDetails'>
        <span>${order.quantity}</span>
        <span>@ $${order.price.toFixed(2)}</span>
        <span>$${order.totalPrice.toFixed(2)}</span>
        </div>
        <img src= './assets/images/icon-remove-item.svg' id='${order.id}' onclick='removeOrder(this.id)'>
        </div>
        `
    })
}
orderCounter.innerText = totalQuantity;
renderOrdersDetails(currentOrders , totalPrice);
}

function renderOrdersDetails(orders,totalPrice){
    const totalOrdersContainer = document.querySelector('.app__container-order__total');
    const infoContainer = document.querySelector('.app__container-order__info');
    const orderBtn = document.querySelector('.app__container-order__btn');
    const totalElement = document.querySelector(".total");
    if(orders.length < 1){
        totalOrdersContainer.style.display = "none";
        infoContainer.style.display = "none";
        orderBtn.style.display = 'none';
    }else {
        totalOrdersContainer.style.display = "flex";
        infoContainer.style.display = "flex";
        orderBtn.style.display = 'block';
    }
    totalElement.textContent = `$${totalPrice.toFixed(2)}`;
}

function checkSelectedOrders(product) {
    const quantityButtons = document.querySelectorAll('.product__container-image .product__actions .quantity');
    const selectedProduct = findProductById(product.id);
    quantityButtons.forEach((quantityButton) => {
        const cartButton = quantityButton.previousElementSibling;
        const qValue = quantityButton.querySelector('span');
        const selectedImg = quantityButton.closest('.product__container-image').querySelector('picture img');

      if (selectedProduct.find  && selectedProduct.find.id === +cartButton.id) {
        qValue.innerText = selectedProduct.find.quantity;
        quantityButton.classList.add('show');
        cartButton.classList.add('hide');
        selectedImg.classList.add('selected');
      }
    });
  }

function findProductById(id='') {
    const ordersList = JSON.parse(localStorage.getItem('cart')) || [];
    return {'orderList' : ordersList , 'find' : ordersList.find((product) => product.id === id)};
   }

function updateLocalStorage(data){
    localStorage.setItem('cart' , JSON.stringify(data));
}

function confirmOrder(){
    const confirmOrderList = document.querySelector('.app__popup-orderlist__orders .orders-list');
    const total = document.querySelector('.app__popup-order__total .total');
    let totalPrice = 0;
    const cart = findProductById();
    confirmOrderList.innerHTML = '';
    cart.orderList.map((product)=>{
        totalPrice+= product.totalPrice;
        confirmOrderList.innerHTML += `<div class="order">
              <img src=${JSON.stringify(product.image)}>
              <div class="order_details">
                <h3>${product.name}</h3>
                <div>
                  <span>X${product.quantity}</span>
                  <span>@$${product.price.toFixed(2)}</span>
                  <span class="orderTotalPrice">
                  $${product.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>`
    })
    total.innerText = `$${totalPrice.toFixed(2)}`;
    const order = document.querySelector('.order');
    if(cart.orderList.length > 3){
        confirmOrderList.classList.add('scroll');
        confirmOrderList.style.height = `${order.clientHeight * 3}px`;
    }
}

function showPopup(){
    const popup = document.querySelector('.app__popup');
    popup.classList.add('visable');
    confirmOrder();
}
function hidePopUp(){
    const popup = document.querySelector('.app__popup');
    const confirmOrderList = document.querySelector('.app__popup-orderlist__orders .orders-list');
    confirmOrderList.style.height = 'auto';
    confirmOrderList.classList.remove('scroll');
    popup.classList.remove('visable');
}
function startNewOrder(){
    updateLocalStorage([]);
    const actionBtns = document.querySelectorAll('.product__container-image .product__actions');
    actionBtns.forEach((e)=> { 
        const img = e.previousElementSibling.querySelector('img');
        const quantityValue = e.querySelector('.quantity span')
        const quantityBtn = e.querySelector('.quantity');
        const cartBtn = e.querySelector('button')
        if(quantityBtn.classList.contains('show')){
            quantityValue.innerText = 1;
            img.classList.remove('selected');
            quantityBtn.classList.remove('show');
            cartBtn.classList.remove('hide')
        }
    });
    renderOrders();
    hidePopUp();
}
getProducts();
renderOrders();
