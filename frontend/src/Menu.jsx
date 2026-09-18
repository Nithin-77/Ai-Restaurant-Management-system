import { useEffect, useState } from "react";

import {
  getMenu,
  createMenu,
  updateMenu,
  deleteMenu,
  toggleMenuAvailability,
} from "./api";

function Menu() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [available, setAvailable] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");

  // =========================
  // LOAD MENU
  // =========================

  const loadMenu = async () => {
    try {
      setLoading(true);

      const data = await getMenu();
      setMenu(data);
    } catch (error) {
      console.error("Menu API Error:", error);
      alert("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setName("");
    setCategory("");
    setPrice("");
    setAvailable(true);
    setEditingId(null);
  };

  // =========================
  // OPEN ADD FORM
  // =========================

  const handleAddClick = () => {
    resetForm();
    setShowForm(true);
  };

  // =========================
  // OPEN EDIT FORM
  // =========================

  const handleEdit = (item) => {
    setEditingId(item.id);

    setName(item.name || "");
    setCategory(item.category || "");
    setPrice(item.price || "");
    setAvailable(item.available);

    setShowForm(true);
  };

  // =========================
  // SAVE MENU
  // =========================

  const handleSaveMenu = async (e) => {
    e.preventDefault();

    if (!name.trim() || !category.trim() || !price) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      available: available,
    };

    try {
      // EDIT
      if (editingId !== null) {
        await updateMenu(editingId, payload);

        alert("Menu item updated successfully!");
      }

      // ADD
      else {
        await createMenu(payload);

        alert("Menu item added successfully!");
      }

      resetForm();
      setShowForm(false);

      await loadMenu();
    } catch (error) {
      console.error("Save Menu Error:", error);

      console.error("Server response:", error.response?.data);

      alert(
        error.response?.data?.detail ||
          "Failed to save menu item"
      );
    }
  };

  // =========================
  // DELETE MENU ITEM
  // =========================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteMenu(id);

      alert("Menu item deleted successfully!");

      await loadMenu();
    } catch (error) {
      console.error("Delete Menu Error:", error);

      alert(
        error.response?.data?.detail ||
          "Failed to delete menu item"
      );
    }
  };

  // =========================
  // TOGGLE AVAILABILITY
  // =========================

  const handleAvailability = async (id) => {
    try {
      await toggleMenuAvailability(id);

      await loadMenu();
    } catch (error) {
      console.error("Availability Error:", error);

      alert(
        error.response?.data?.detail ||
          "Failed to update availability"
      );
    }
  };

  // =========================
  // CATEGORIES
  // =========================

  const categories = [
    "All",
    ...new Set(
      menu
        .map((item) => item.category)
        .filter(Boolean)
    ),
  ];

  // =========================
  // FILTER MENU
  // =========================

  const filteredMenu = menu.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" ||
      item.category === categoryFilter;

    const matchesAvailability =
      availabilityFilter === "All" ||
      (availabilityFilter === "Available" &&
        item.available === true) ||
      (availabilityFilter === "Unavailable" &&
        item.available === false);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesAvailability
    );
  });

  // =========================
  // UI
  // =========================

  return (
    <div className="menu-page">

      {/* =========================
          HEADER
      ========================== */}

      <div className="page-header">

        <div>
          <h1>Menu Management</h1>

          <p>
            Manage your restaurant food items.
          </p>
        </div>

        <button
          className="add-button"
          onClick={handleAddClick}
        >
          + Add Menu Item
        </button>

      </div>


      {/* =========================
          ADD / EDIT FORM
      ========================== */}

      {showForm && (
        <div className="menu-form-panel">

          <h2>
            {editingId !== null
              ? "Edit Menu Item"
              : "Add New Menu Item"}
          </h2>

          <form onSubmit={handleSaveMenu}>

            {/* FOOD NAME */}

            <div className="form-group">

              <label>
                Food Name
              </label>

              <input
                type="text"
                placeholder="Enter food name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

            </div>


            {/* CATEGORY */}

            <div className="form-group">

              <label>
                Category
              </label>

              <input
                type="text"
                placeholder="Example: Main Course"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
              />

            </div>


            {/* PRICE */}

            <div className="form-group">

              <label>
                Price
              </label>

              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter price"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
              />

            </div>


            {/* AVAILABILITY */}

            <div className="form-group">

              <label>
                Availability
              </label>

              <select
                value={available ? "Available" : "Unavailable"}
                onChange={(e) =>
                  setAvailable(
                    e.target.value === "Available"
                  )
                }
              >
                <option value="Available">
                  Available
                </option>

                <option value="Unavailable">
                  Unavailable
                </option>

              </select>

            </div>


            {/* BUTTONS */}

            <div className="form-buttons">

              <button
                type="submit"
                className="save-button"
              >
                {editingId !== null
                  ? "Update Menu Item"
                  : "Save Menu Item"}
              </button>


              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}


      {/* =========================
          SEARCH + FILTERS
      ========================== */}

      <div className="menu-filters">

        {/* SEARCH */}

        <input
          type="text"
          placeholder="🔍 Search food..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="search-input"
        />


        {/* CATEGORY */}

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
          className="filter-select"
        >

          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}

        </select>


        {/* AVAILABILITY */}

        <select
          value={availabilityFilter}
          onChange={(e) =>
            setAvailabilityFilter(e.target.value)
          }
          className="filter-select"
        >

          <option value="All">
            All Availability
          </option>

          <option value="Available">
            Available
          </option>

          <option value="Unavailable">
            Unavailable
          </option>

        </select>

      </div>


      {/* =========================
          MENU TABLE
      ========================== */}

      {loading ? (

        <div className="loading">
          Loading menu...
        </div>

      ) : (

        <div className="menu-table-panel">

          <table>

            {/* TABLE HEADER */}

            <thead>

              <tr>

                <th>ID</th>

                <th>
                  Food Name
                </th>

                <th>
                  Category
                </th>

                <th>
                  Price
                </th>

                <th>
                  Availability
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            {/* TABLE BODY */}

            <tbody>

              {filteredMenu.length === 0 ? (

                <tr>

                  <td colSpan="6">
                    No menu items found.
                  </td>

                </tr>

              ) : (

                filteredMenu.map((item, index) => (

                  <tr key={item.id}>

                    {/* ID */}

                    <td>
                      #{index + 1}
                    </td>


                    {/* NAME */}

                    <td>
                      <strong>
                        {item.name}
                      </strong>
                    </td>


                    {/* CATEGORY */}

                    <td>
                      {item.category}
                    </td>


                    {/* PRICE */}

                    <td>
                      ₹
                      {Number(item.price).toFixed(2)}
                    </td>


                    {/* AVAILABILITY */}

                    <td>

                      {item.available ? (

                        <span className="availability available">
                          Available
                        </span>

                      ) : (

                        <span className="availability unavailable">
                          Unavailable
                        </span>

                      )}

                    </td>


                    {/* ACTIONS */}

                    <td>

                      <div className="menu-actions">

                        {/* EDIT */}

                        <button
                          className="edit-button"
                          onClick={() =>
                            handleEdit(item)
                          }
                        >
                          ✏️ Edit
                        </button>


                        {/* TOGGLE */}

                        <button
                          className="availability-button"
                          onClick={() =>
                            handleAvailability(item.id)
                          }
                        >
                          🔄 Toggle
                        </button>


                        {/* DELETE */}

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                        >
                          🗑️ Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      )}


      {/* =========================
          ITEM COUNT
      ========================== */}

      <p className="menu-count">

        Showing {filteredMenu.length} of{" "}
        {menu.length} menu items

      </p>

    </div>
  );
}

export default Menu;