"use client";

import { app } from "@/utils/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
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

  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("User state changed:", user);
      if (!user) {
        return <div>Please log in to access the dashboard.</div>;
      }

      setIdUser(user.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(productsCollectionRef);
        const filtered = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((product) => product.sellerId === idUser);

        console.log("Filtered Products:", filtered);
        setProducts(filtered);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (idUser) {
      fetchProducts();
    }
  }, [idUser]);

  const filteredProducts = products
    .filter((product) => {
      // Ensure product.name exists and handle empty searchTerm
      if (!product.name) return false;
      return searchTerm
        ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
    })
    .filter((product) => {
      // Handle selectedCategory being null or undefined
      return selectedCategory ? product.category === selectedCategory : true;
    });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div>
      <h1>Welcome to Seller Dashboard {idUser}</h1>

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
          <button className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
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
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.map((product, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">
                {product.name}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                <img
                  src={product.image}
                  alt="Product"
                  className="w-16 h-16 object-cover"
                />
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {product.quantity}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                ${product.price}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {product.category}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {product.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="my-4">
        <button
          className="border px-2 py-1"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </button>
        <span className="mx-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="border px-2 py-1"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DashboardSellerPage;
