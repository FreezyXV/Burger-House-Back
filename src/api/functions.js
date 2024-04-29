
const BASE_URL = `http://localhost:2233/api`;

// Afficher tous les Produits (hors Menus)
export const getAllItems = async (type) => {
  try {
    const endpoint = type ? `/products?type=${type}` : "/products";
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const items = await response.json();
    return items;
  } catch (error) {
    console.error("There was an error getting all products: ", error);
    throw error;
  }
};

// Afficher tous les Menus
export const getAllMenus = async () => {
  try {
    const response = await fetch(`${BASE_URL}/menus`);
    const allMenus = await response.json();
    return allMenus;
  } catch (error) {
    console.error("There was an error getting all menus: ", error);
    throw error;
  }
};

//Aficher le Menu par son ID
export const getMenuById = async (menuId) => {
  const response = await fetch(`${BASE_URL}/menus/${menuId}`);
  if (!response.ok) {
    throw new Error("Menu not found");
  }
  return await response.json();
};

// Actualiser les  informations d'un Produit (Pas Menu)
export const updateProduct = async (productId, productData) => {
  try {
    const response = await fetch(`${BASE_URL}/products/modify/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });
    console.log("Product update response status:", response.status);

    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating product: ", error);
    throw error;
  }
};

//Supprimer un Produit (Pas Menu)
export const deleteProduct = async (productId) => {
  try {
    const response = await fetch(`${BASE_URL}/products/delete/${productId}`, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting product: ", error);
    throw error;
  }
};

// Actualiser un menu
export const updateMenu = async (menuId, menuData) => {
  try {
    const response = await fetch(`${BASE_URL}/menus/modify/${menuId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(menuData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating menu: ", error);
    throw error;
  }
};

//Supprimer un Menu
export const deleteMenu = async (menuId) => {
  try {
    const response = await fetch(`${BASE_URL}/menus/delete/${menuId}`, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting menu: ", error);
    throw error;
  }
};

export async function getItemById(type, id) {
  var response = null;

  if (type === "Menu") {
    response = await fetch(`${BASE_URL}/menus/${id}`);
  } else {
    response = await fetch(`${BASE_URL}/products/${id}`);
  }

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Actualiser Menu ou Produit
export const updateItem = async (type, id, updatedItem, authToken) => {
  const endpoint =
    type === "Menu" ? `menus/modify/${id}` : `products/modify/${id}`;
  try {
    console.log(endpoint);
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(updatedItem),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating ${type} by id: ${id}`, error);
    throw error;
  }
};



// Valider une Commande
export const submitOrder = async (orderPayload) => {
  try {
    const response = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to submit order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error submitting order:", error);
    throw error;
  }
};

// Créer un Produit
export const createProduct = async (productData) => {
  try {
    const response = await fetch(`${BASE_URL}/products/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error("Failed to create product");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating product: ", error);
    throw error;
  }
};

//Créer un Menu
export const createMenu = async (menuData) => {
  try {
    const response = await fetch(`${BASE_URL}/menus/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(menuData),
    });
    if (!response.ok) {
      throw new Error("Failed to create menu");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating menu: ", error);
    throw error;
  }
};
