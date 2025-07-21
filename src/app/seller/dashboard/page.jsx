"use client";

import { app } from "@/utils/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { useEffect, useState } from "react";

const categories = ["Elektronik", "Pakaian", "Makanan"];

const DashboardSellerPage = () => {
  const db = getFirestore(app);
  const auth = getAuth(app);
  const productsCollectionRef = collection(db, "products");

  const [loading, setLoading] = useState(true);
  const [idUser, setIdUser] = useState("");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    image: "",
    quantity: "",
    price: "",
    category: "",
    description: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      setIdUser(user.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchProducts = async () => {
    if (!idUser) return;

    try {
      const querySnapshot = await getDocs(productsCollectionRef);
      const filtered = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((product) => product.sellerId === idUser);

      setProducts(filtered);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    if (idUser) {
      fetchProducts();
    }
  }, [idUser]);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const newDocRef = doc(productsCollectionRef);
      const batch = writeBatch(db);

      batch.set(newDocRef, {
        ...newProduct,
        sellerId: idUser,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      setShowModal(false);
      setNewProduct({
        name: "",
        image: "",
        quantity: "",
        price: "",
        category: "",
        description: "",
      });

      fetchProducts();
    } catch (error) {
      console.error("Failed to add product", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "products", productId));
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const filteredProducts = products
    .filter((product) => {
      if (!product.name) return false;
      return searchTerm
        ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
    })
    .filter((product) => {
      return selectedCategory ? product.category === selectedCategory : true;
    });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div>
      <h1 className="text-xl font-semibold m-4">
        Welcome to Seller Dashboard {idUser}
      </h1>

      <div className="flex flex-row my-4 justify-between items-center m-4">
        <div>
          <input
            type="text"
            placeholder="Search by name"
            className="border px-2 py-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border px-2 py-1 ml-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-plus mr-2"></i>
            Add New Product
          </button>
        </div>
      </div>

      <table className="table-auto border-collapse border border-gray-300 w-full text-left mx-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Image</th>
            <th className="border border-gray-300 px-4 py-2">Stock Quantity</th>
            <th className="border border-gray-300 px-4 py-2">Price</th>
            <th className="border border-gray-300 px-4 py-2">Category</th>
            <th className="border border-gray-300 px-4 py-2">Description</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.map((product, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{product.name}</td>
              <td className="border border-gray-300 px-4 py-2">
                <img
                  src={product.image}
                  alt="Product"
                  className="w-16 h-16 object-cover"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">{product.quantity}</td>
              <td className="border border-gray-300 px-4 py-2">${product.price}</td>
              <td className="border border-gray-300 px-4 py-2">{product.category}</td>
              <td className="border border-gray-300 px-4 py-2">{product.description}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="my-4 flex items-center justify-center gap-4">
        <button
          className="border px-3 py-1"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="border px-3 py-1"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>

            <input
              className="border p-2 w-full mb-2"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="Image URL"
              value={newProduct.image}
              onChange={(e) =>
                setNewProduct({ ...newProduct, image: e.target.value })
              }
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="Stock Quantity"
              type="number"
              value={newProduct.quantity}
              onChange={(e) =>
                setNewProduct({ ...newProduct, quantity: e.target.value })
              }
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="Price"
              type="number"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
            />
            <select
              className="border p-2 w-full mb-2"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <textarea
              className="border p-2 w-full mb-4"
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            ></textarea>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleAddProduct}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSellerPage;
