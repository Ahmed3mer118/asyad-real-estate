import { useEffect, useState, useCallback } from 'react';
import UserLayout from '../../../layouts/UserLayout.jsx';
import PropertyCard from '../../../components/property/PropertyCard.jsx';
import { favoriteService } from '../../../services/index.js';
import { Spinner, Empty } from '../../../components/common/index.jsx';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await favoriteService.getMyFavorites();
      setFavorites(res.data?.properties || []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return (
    <UserLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-dark mb-2">My Favorites</h1>
        <p className="text-gray mb-8">Properties you liked and saved to your account.</p>

        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : favorites.length === 0 ? (
          <Empty
            icon="❤️"
            title="No favorites yet"
            sub="Tap the heart on any property to save it here."
          />
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">
              {favorites.length} saved {favorites.length === 1 ? 'property' : 'properties'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {favorites.map((p) => (
                <PropertyCard key={p.id} property={p} onFavoriteChange={loadFavorites} />
              ))}
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default FavoritesPage;
