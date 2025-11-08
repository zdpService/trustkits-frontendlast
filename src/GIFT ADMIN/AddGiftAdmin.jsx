import React, { useState } from "react";
import { useGiftContext } from "../context/GiftContext";
import Loading from "../utilities/laoding/Loading";
import "./AddGiftAdmin.css";
import AccountLayout from "../layout/AccountLayout";

const categories = [
  "Romantique",
  "Bébé",
  "Personnes âgées",
  "Tech",
  "Maison",
  "Sport",
  "Loisirs",
];

const AddGiftAdmin = () => {
  const { addGiftToCatalog, loading } = useGiftContext();

  const [formData, setFormData] = useState({
    name: "",
    category: categories[0],
    price: "",
    imageUrl: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.imageUrl) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const priceInCoins = `${parseInt(formData.price).toLocaleString(
      "fr-FR"
    )} coins`;

    const newGift = {
      name: formData.name.trim(),
      category: formData.category,
      price: priceInCoins,
      image: formData.imageUrl,
    };

    try {
      await addGiftToCatalog(newGift);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      // Reset
      setFormData({
        name: "",
        category: categories[0],
        price: "",
        imageUrl: "",
      });
      setImagePreview(null);
    } catch (error) {
      console.error("Erreur ajout cadeau:", error);
      alert("Erreur lors de l'ajout. Veuillez réessayer.");
    }
  };

  return (
    <AccountLayout>
      <div className="add-gift-admin">
        <div className="admin-header">
          <h1>Ajouter un nouveau cadeau</h1>
          <p>Gérez votre catalogue de cadeaux premium</p>
        </div>

        {loading && <Loading message="Ajout en cours..." />}

        <form className="add-gift-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom du cadeau *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Coffret champagne personnalisé"
              required
            />
          </div>

          <div className="form-group">
            <label>Catégorie *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Prix en Coins *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="5250"
              min="1"
              required
            />
            <small>
              →{" "}
              {formData.price &&
                `${parseInt(formData.price).toLocaleString("fr-FR")} Coins`}
            </small>
          </div>

          <div className="form-group">
            <label>Image du cadeau *</label>
            <div className="image-upload">
              <input
                type="text"
                placeholder="Coller l'URL de l'image"
                value={formData.imageUrl}
                onChange={handleImageUrlChange}
              />
              <span className="or-text">ou</span>
              <label className="file-label">
                Choisir un fichier
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            {uploading && <p className="uploading-text">Upload en cours...</p>}
          </div>

          {imagePreview && (
            <div className="image-preview">
              <p>Aperçu :</p>
              <img src={imagePreview} alt="Aperçu" />
            </div>
          )}

          <button
            type="submit"
            className="add-gift-btn"
            disabled={
              loading || !formData.name || !formData.price || !formData.imageUrl
            }
          >
            {loading ? "Ajout en cours..." : "Ajouter le cadeau"}
          </button>

          {success && (
            <div className="success-message">Cadeau ajouté avec succès !</div>
          )}
        </form>
      </div>
    </AccountLayout>
  );
};

export default AddGiftAdmin;
