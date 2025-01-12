import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './SinglePage.scss';
import Navbar from "../Navbar/Navbar";

function SinglePage() {
    const { id } = useParams();
    const [property, setProperty] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ text: "", rating: 1 });
    const [userId, setUserId] = useState(null);
    const [visitDate, setVisitDate] = useState("");  // Adăugăm state pentru data vizionării
    const [message, setMessage] = useState("");  // Mesaj de succes / eroare

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await fetch(`http://localhost:3000/properties/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProperty(data);
                } else {
                    console.error("Failed to fetch property details");
                }
            } catch (error) {
                console.error("Error fetching property details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchReviews = async () => {
            try {
                const response = await fetch(`http://localhost:3000/properties/${id}/reviews`);
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data);
                } else {
                    console.error("Failed to fetch reviews");
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };

        const fetchUserId = async () => {
            const email = localStorage.getItem("userEmail"); // Obține email-ul din localStorage
            if (!email) {
                console.error("User not logged in");
                return;
            }

            try {
                const response = await fetch(`http://localhost:3000/users?email=${email}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserId(data.id_user); // Stocăm ID-ul utilizatorului
                } else {
                    console.error("Failed to fetch user ID");
                }
            } catch (error) {
                console.error("Error fetching user ID:", error);
            }
        };

        fetchProperty();
        fetchReviews();
        fetchUserId();
    }, [id]);

    // Funcția pentru a trimite cererea de programare a vizionării
    const handleScheduleVisit = async (e) => {
        e.preventDefault();
    
        if (!visitDate || !userId) {
            setMessage("Vă rugăm să selectați o dată validă pentru vizionare.");
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:3000/properties/${id}/visits`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_user: userId,  // Verifică dacă id_user există și este valid
                    id_prop: id,  // id_prop este setat ca id din URL
                    data_vizionare: visitDate,  // Asigură-te că data este corectă
                }),
            });
    
            if (response.ok) {
                setMessage("Vizionarea a fost programată cu succes!");
                setVisitDate("");  // Resetăm data
            } else {
                const errorResponse = await response.json();
                setMessage(errorResponse.message || "A apărut o eroare la programarea vizionării.");
            }
        } catch (error) {
            console.error("Error scheduling visit:", error);
            setMessage("A apărut o eroare la programarea vizionării.");
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.text || newReview.rating < 1 || newReview.rating > 5 || !userId) return;

        try {
            const response = await fetch(`http://localhost:3000/properties/${id}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id_user: userId, ...newReview }), // Adăugăm ID-ul utilizatorului
            });

            if (response.ok) {
                const data = await response.json();
                setReviews((prev) => [...prev, data]);
                setNewReview({ text: "", rating: 1 });
            } else {
                console.error("Failed to submit review");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };

    if (isLoading) {
        return <div className="loading">Se încarcă detaliile proprietății...</div>;
    }

    if (!property) {
        return <div className="error">Proprietatea nu a fost găsită.</div>;
    }

    return (
        <div className="singlePage">
            <div className="navbar-singlepage"><Navbar /></div>
            <div className="content">
                <div className="imageSection">
                    <img src={property.img || '/placeholder.png'} alt={property.title} />
                </div>
                <div className="detailsSection">
                    <h1 className="propertyTitle">{property.title}</h1>
                    <div className="detailsBox">
                        <div className="detailsGrid">
                            <div className="detailItem">
                                <img src="/pin.png" alt="location" />
                                <span>{property.address}</span>
                            </div>
                            <div className="detailItem">
                                <img src="/bed.png" alt="bedroom" />
                                <span>{property.bedroom} camere</span>
                            </div>
                            <div className="detailItem">
                                <img src="/size.png" alt="surface" />
                                <span>{property.surface} m²</span>
                            </div>
                            <div className="detailItem priceItem">
                                <span>{property.price} USD</span>
                            </div>
                            <div className="detailItem">
                                <img src="/calendar.png" alt="year" />
                                <span>{property.year}</span>
                            </div>
                            <div className="detailItem">
                                <img src="/category.png" alt="category" />
                                <span>{property.category}</span>
                            </div>
                            <div className="detailItem">
                                <img src="/status.png" alt="status" />
                                <span>{property.status === 'cumparare' ? 'De vânzare' : 'De închiriat'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="descriptionSection">
                <h2 className="descriptionTitle">Descrierea proprietății</h2>
                {property.description ? (
                    <p className="descriptionText">{property.description}</p>
                ) : (
                    <p className="descriptionPlaceholder">Nu există o descriere disponibilă pentru această proprietate.</p>
                )}
            </div>

            {/* Secțiunea de programare a vizionării */}
            <div className="scheduleVisitSection">
                <h2>Programează o vizionare</h2>
                <form onSubmit={handleScheduleVisit}>
                    <label htmlFor="visitDate">Alege data vizionării:</label>
                    <input
                        type="date"
                        id="visitDate"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        required
                    />
                    <button type="submit">Programează Vizionare</button>
                </form>
                {message && <p>{message}</p>}
            </div>

            {["inchiriere", "inchiriat"].includes(property.status) && (
                <div className="reviewsSection">
                    <h2>Recenzii</h2>
                    <div className="reviewsList">
                        {reviews.length > 0 ? (
                            reviews.map((review, index) => (
                                <div key={index} className="reviewItem">
                                    <p className="reviewText">{review.text || "Recenzie indisponibila"}</p>
                                    <div className="reviewMeta">
                                        <div className="reviewMetaItem">
                                            <img src="/user.png" alt="user" />
                                            <span>{review.user_name || "Anonim"}</span>
                                        </div>
                                        <div className="reviewMetaItem">
                                            <img src="/star.png" alt="star" />
                                            <span>Rating: {review.rating ? `${review.rating}/5` : "N/A"}</span>
                                        </div>
                                        <div className="reviewMetaItem">
                                            <img src="/date.png" alt="date" />
                                            <span>{review.date ? new Date(review.date).toLocaleDateString() : "Dată indisponibilă"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="noReviews">Nu există recenzii încă.</p>
                        )}
                    </div>

                    <form className="addReviewForm" onSubmit={handleReviewSubmit}>
                        <textarea
                            placeholder="Scrie o recenzie..."
                            value={newReview.text}
                            onChange={(e) => setNewReview((prev) => ({ ...prev, text: e.target.value }))}
                            required
                        />
                        <select
                            value={newReview.rating}
                            onChange={(e) => setNewReview((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                        >
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <option key={rating} value={rating}>
                                    {rating} stele
                                </option>
                            ))}
                        </select>
                        <button type="submit">Adaugă recenzie</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default SinglePage;