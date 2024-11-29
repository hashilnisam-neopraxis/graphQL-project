import PageManager from "../../theme/page-manager";

    export default class ProductData extends PageManager {
        constructor(context) {
            super(context);
            console.log("context", context);
            this.accesstoken = context.credential;
            this.productId = context.productId;
        }

        onReady() {
            this.getCustomFields();
        }   

        getCustomFields() {
            console.log("accesstoken", this.accesstoken);
            console.log("productId", this.productId);
        
            fetch("/graphql", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.accesstoken}`,
                },
                body: JSON.stringify({
                    query: `query {
                        site {
                            product(entityId: ${this.productId}) {
                                name
                                defaultImage {
                                    urlOriginal
                                }
                                images {
                                    edges {
                                        node {
                                            urlOriginal
                                        }
                                    }
                                }
                                brand {
                                    name
                                }
                                prices {
                                    salePrice {
                                        value
                                    }
                                }
                                relatedProducts {
                                    edges {
                                        node {
                                            entityId
                                            images {
                                                edges {
                                                    node {
                                                        urlOriginal
                                                    }
                                                }
                                            }
                                            name
                                            brand {
                                                name
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }`,
                }),
            })
                .then((res) => res.json()) 
                .then((data) => {
        
                    console.log(data);
        
                    const productDetails = {
                        name: data.data.site.product.name, 
                        imageUrl: data.data.site.product.defaultImage.urlOriginal,
                        brand: data.data.site.product.brand.name,
                        prices: data.data.site.product.prices.salePrice.value,
                    };
        
                    console.log("productDetails====>", productDetails);
        
                    const productDetailsImage = document.querySelector(".product-image-main");
                    productDetailsImage.innerHTML = `
                       <img src="${productDetails.imageUrl}" alt="${productDetails.name}" />
                    `;
                    const productName =document.querySelector(".pdp-name");
                    productName.innerHTML = `${productDetails.name}`;
        
                    const productBrand =document.querySelector(".pdp-brand");
                    productBrand.innerHTML = `${productDetails.brand}`;
        
                    const productMsrp =document.querySelector(".pdp-price");
                    productMsrp.innerHTML = `€${productDetails.prices}`;
        
                    const relatedProducts = data.data.site.product.relatedProducts.edges.map(edge => ({
                        entityId: edge.node.entityId,
                        name: edge.node.name,
                        imageUrl: edge.node.images.edges.map(imageEdge => imageEdge.node.urlOriginal),
                        brand: edge.node.brand.name,
                    }));
        
                    const carousel = document.querySelector('.carousel');
                    
                    relatedProducts.forEach(product => {
                        const productItem = document.createElement('li');
                        productItem.classList.add('card');
                        
                        const productImage = document.createElement('div');
                        productImage.classList.add('img');
                        const img = document.createElement('img');
                        img.src = product.imageUrl[0];  // Use the first image for the product
                        img.alt = product.name;
                        productImage.appendChild(img);
        
                        const childImageRow = document.createElement('div');
                        childImageRow.classList.add('row', 'child-container-image-row');
                        
                        // Add the child images (first 4 or all, depending on available data)
                        product.imageUrl.slice(1, 5).forEach(url => {
                            const childImageDiv = document.createElement('div');
                            childImageDiv.classList.add('small-3', 'large-3', 'columns', 'child-container-image');
                            const childImg = document.createElement('img');
                            childImg.src = url;
                            childImg.alt = `Related image ${url}`;
                            childImageDiv.appendChild(childImg);
                            childImageRow.appendChild(childImageDiv);
        
                            // Add event listener to change the main image when clicked
                            childImg.addEventListener('click', function() {
                                const mainImage = document.querySelector(".product-image-main img");
                                mainImage.src = url; // Change the main image to the clicked child image
                            });
                        });
        
                        const productName = document.createElement('div');
                        productName.classList.add('slider-head');
                        productName.textContent = product.name;
        
                        const productBrand = document.createElement('span');
                        productBrand.textContent = product.brand;
        
                        const addButton = document.createElement('button');
                        addButton.classList.add('related_products_button');
                        addButton.textContent = 'Add to Cart';
                        
                        addButton.onclick = function() {
                            console.log("product id===>", product.entityId);
                            window.location.href = `/cart.php?action=add&product_id=${product.entityId}`;
                        };
        
                        productItem.appendChild(productImage);
                        productItem.appendChild(childImageRow);
                        productItem.appendChild(productName);
                        productItem.appendChild(productBrand);
                        productItem.appendChild(addButton);
        
                        carousel.appendChild(productItem);
                    });
        
                    console.log("relatedProducts====>", relatedProducts);
        
                    document.getElementById('left').addEventListener('click', function() {
                        const carousel = document.querySelector('.carousel');
                        carousel.scrollBy({
                            left: -300, 
                            behavior: 'smooth'
                        });
                    });
        
                    document.getElementById('right').addEventListener('click', function() {
                        const carousel = document.querySelector('.carousel');
                        carousel.scrollBy({
                            left: 300, 
                            behavior: 'smooth'
                        });
                    });
                })
                .catch((error) => {
                    console.error("Error fetching data:", error);
                });
        }
        
    }