import { HomeHero } from '../../components/home/HomeHero'
import { HomeCallToAction } from '../../components/home/PublicFooter'
import { HomeBenefits, HomeFaq, HomeRequirements, HomeSteps } from '../../components/home/HomeSections'
import { PublicLayout } from '../../components/home/PublicLayout'

interface SellerHomePageProps {
  dashboardHref?: string
}

export function SellerHomePage({ dashboardHref }: SellerHomePageProps) {
  return (
    <PublicLayout dashboardHref={dashboardHref}>
      <main>
        <HomeHero />
        <HomeBenefits />
        <HomeSteps />
        <HomeRequirements />
        <HomeFaq />
        <HomeCallToAction />
      </main>
    </PublicLayout>
  )
}
