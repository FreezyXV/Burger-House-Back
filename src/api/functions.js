const BASE_URL = `${process.env.BACKEND_URL || "http://localhost:2233"}/api`;

const fetchApi = async (
  endpoint,
  method = "GET",
  body = null,
  authToken = null
) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const config = {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
};

// Afficher tous les Produits (hors Menus)
export const getAllItems = async (type) => {
  try {
    const endpoint = type ? `/products?type=${type}` : "/products";
    const items = await fetchApi(endpoint);
    return items;
  } catch (error) {
    console.error("There was an error getting all products: ", error);
    throw error;
  }
};

// Afficher tous les Menus
export const getAllMenus = async () => {
  try {
    const allMenus = await fetchApi("/menus");
    return allMenus;
  } catch (error) {
    console.error("There was an error getting all menus: ", error);
    throw error;
  }
};

//Aficher le Menu par son ID
export const getMenuById = async (menuId) => {
  return await fetchApi(`/menus/${menuId}`);
};

// Actualiser les  informations d'un Produit (Pas Menu)
export const updateProduct = async (productId, productData) => {
  try {
    const response = await fetchApi(
      `/products/modify/${productId}`,
      "PUT",
      productData
    );
    console.log("Product update response status:", response.status);

    return response;
  } catch (error) {
    console.error("Error updating product: ", error);
    throw error;
  }
};

//Supprimer un Produit (Pas Menu)
export const deleteProduct = async (productId) => {
  try {
    const response = await fetchApi(`/products/delete/${productId}`, "DELETE");
    return response;
  } catch (error) {
    console.error("Error deleting product: ", error);
    throw error;
  }
};

// Actualiser un menu
export const updateMenu = async (menuId, menuData) => {
  try {
    const response = await fetchApi(`/menus/modify/${menuId}`, "PUT", menuData);
    return response;
  } catch (error) {
    console.error("Error updating menu: ", error);
    throw error;
  }
};

//Supprimer un Menu
export const deleteMenu = async (menuId) => {
  try {
    const response = await fetchApi(`/menus/delete/${menuId}`, "DELETE");
    return response;
  } catch (error) {
    console.error("Error deleting menu: ", error);
    throw error;
  }
};

export async function getItemById(type, id) {
  const endpoint = type === "Menu" ? `/menus/${id}` : `/products/${id}`;
  try {
    return await fetchApi(endpoint);
  } catch (error) {
    if (error.message.includes("404")) {
      return null;
    }
    throw error;
  }
}

// Actualiser Menu ou Produit
export const updateItem = async (type, id, updatedItem, authToken) => {
  const endpoint =
    type === "Menu" ? `menus/modify/${id}` : `products/modify/${id}`;
  try {
    console.log(endpoint);
    const response = await fetchApi(endpoint, "PUT", updatedItem, authToken);

    return response;
  } catch (error) {
    console.error(`Error updating ${type} by id: ${id}`, error);
    throw error;
  }
};

// Valider une Commande
export const submitOrder = async (orderPayload) => {
  try {
    const response = await fetchApi("/orders", "POST", orderPayload);

    return response;
  } catch (error) {
    console.error("Error submitting order:", error);
    throw error;
  }
};

// Créer un Produit
export const createProduct = async (productData) => {
  try {
    const response = await fetchApi("/products/add", "POST", productData);
    if (!response.ok) {
      throw new Error("Failed to create product");
    }
    return response;
  } catch (error) {
    console.error("Error creating product: ", error);
    throw error;
  }
};

//Créer un Menu
export const createMenu = async (menuData) => {
  try {
    const response = await fetchApi("/menus/add", "POST", menuData);
    if (!response.ok) {
      throw new Error("Failed to create menu");
    }
    return response;
  } catch (error) {
    console.error("Error creating menu: ", error);
    throw error;
  }
};
