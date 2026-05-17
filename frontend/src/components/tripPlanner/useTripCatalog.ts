import { useEffect, useState } from "react";
import { getApiUrl, parseJsonSafely } from "../../lib/api";

export type TourType = { _id: string; name: string };

export type DestinationItem = {
  id: string;
  name: string;
  location?: string;
};

export type CatalogPackage = {
  id: string;
  title: string;
  price?: string;
  duration?: string;
  type?: string;
  destinations: string[];
  path: string;
};

export function useTripCatalog(enabled: boolean) {
  const [tourTypes, setTourTypes] = useState<TourType[]>([]);
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [packages, setPackages] = useState<CatalogPackage[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const load = async () => {
      try {
        const [typesRes, destRes, pkgRes] = await Promise.all([
          fetch(getApiUrl("/api/tour-types")),
          fetch(getApiUrl("/api/destinations?page=1")),
          fetch(getApiUrl("/api/tour-packages?page=1")),
        ]);

        const typesData = await parseJsonSafely(typesRes);
        const destData = await parseJsonSafely(destRes);
        const pkgData = await parseJsonSafely(pkgRes);

        if (cancelled) return;

        if (typesRes.ok && Array.isArray(typesData?.data)) {
          setTourTypes(typesData.data);
        }

        let allDest: DestinationItem[] = [];
        if (destRes.ok && Array.isArray(destData?.data)) {
          allDest = destData.data.map((d: { id?: string; name?: string; location?: string }) => ({
            id: d.id || "",
            name: d.name || "",
            location: d.location,
          }));
          const pages = Number(destData.totalPages) || 1;
          if (pages > 1) {
            const rest = await Promise.all(
              Array.from({ length: pages - 1 }, (_, i) =>
                fetch(getApiUrl(`/api/destinations?page=${i + 2}`)).then(parseJsonSafely)
              )
            );
            for (const page of rest) {
              if (Array.isArray(page?.data)) {
                page.data.forEach((d: { id?: string; name?: string; location?: string }) => {
                  allDest.push({ id: d.id || "", name: d.name || "", location: d.location });
                });
              }
            }
          }
        }
        setDestinations(allDest);

        let allPkg: CatalogPackage[] = [];
        if (pkgRes.ok && Array.isArray(pkgData?.data)) {
          const mapPkg = (p: {
            id?: string;
            title?: string;
            price?: string;
            duration?: string;
            type?: string;
            destinations?: string[];
          }) => ({
            id: p.id || "",
            title: p.title || "",
            price: p.price,
            duration: p.duration,
            type: p.type,
            destinations: p.destinations || [],
            path: `/tour-packages/${p.id}`,
          });
          allPkg = pkgData.data.map(mapPkg);
          const pages = Number(pkgData.totalPages) || 1;
          if (pages > 1) {
            const rest = await Promise.all(
              Array.from({ length: pages - 1 }, (_, i) =>
                fetch(getApiUrl(`/api/tour-packages?page=${i + 2}`)).then(parseJsonSafely)
              )
            );
            for (const page of rest) {
              if (Array.isArray(page?.data)) {
                allPkg.push(...page.data.map(mapPkg));
              }
            }
          }
        }
        setPackages(allPkg);
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  function placesForType(typeName: string) {
    const destSet = new Set<string>();
    packages
      .filter((p) => !typeName || p.type === typeName)
      .forEach((p) => p.destinations.forEach((d) => destSet.add(d)));
    const names = Array.from(destSet).filter(Boolean).sort();
    return names.map((name) => {
      const match = destinations.find(
        (d) => d.name.toLowerCase() === name.toLowerCase() || d.location?.toLowerCase() === name.toLowerCase()
      );
      return { name, destinationId: match?.id || "" };
    });
  }

  function packagesFor(typeName: string, placeName: string) {
    return packages.filter(
      (p) =>
        (!typeName || p.type === typeName) &&
        p.destinations.some((d) => d.toLowerCase() === placeName.toLowerCase())
    );
  }

  return { tourTypes, destinations, packages, ready, placesForType, packagesFor };
}
