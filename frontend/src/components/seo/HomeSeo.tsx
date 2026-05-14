import { useSeo, breadcrumbsJsonLd } from '../../hooks/useSeo'

const HomeSeo = () => {
  useSeo({
    title: 'TchopMyGrinds — Marketplace local de produits exotiques',
    description:
      "Trouvez en un clic les commerçants locaux qui vendent des produits exotiques et frais autour de vous. Géolocalisation 50 km, livraison ou retrait.",
    canonicalPath: '/',
    ogType: 'website',
    jsonLd: breadcrumbsJsonLd([{ name: 'Accueil', path: '/' }]),
  })
  return null
}

export default HomeSeo
