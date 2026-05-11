import Button from "./ui/Button";

const plans = [
  {
    id: "elite",
    title: "Elite Package",
    price: "₹5000",
    tone: "elite",
    features: [
      "Sponsorship - logo on owr website",
      "Events pass - 1 free",
      "Welcome kit - Premium",
      "25% off on entry fee",
      "Welcome kit - Medium",
      "Entry To Woman award function",
    ],
  },
  {
    id: "gold",
    title: "Gold Package",
    price: "₹3000",
    tone: "gold",
    features: [
      "Sponsorship - logo on owr website",
      "Events pass - 1 free",
      "Welcome kit - Medium",
    ],
  },
];

function PlanCard({ plan, onNavigate }) {
  return (
    <section className="membership-plan__section">
      <div className="membership-plan__stars membership-plan__stars--left" aria-hidden="true">
        <span>✦</span>
        <span>✦</span>
      </div>
      <div className="membership-plan__stars membership-plan__stars--right" aria-hidden="true">
        <span>✦</span>
        <span>✦</span>
      </div>

      <h2 className={`membership-plan__title membership-plan__title--${plan.tone}`}>{plan.title}</h2>

      <div className={`membership-plan__card membership-plan__card--${plan.tone}`}>
        <ul>
          {plan.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <p>{plan.price}</p>
      </div>

      <Button
        variant="peach"
        className="membership-plan__select"
        onClick={() => onNavigate("register", { plan: plan.id })}
      >
        Select
      </Button>
    </section>
  );
}

export default function MembershipPage({ onNavigate = () => {} }) {
  return (
    <section className="membership-plan-page">
      <div className="container membership-plan-page__inner">
        <h1>Selected Membership Plan -</h1>
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onNavigate={onNavigate} />
        ))}
      </div>
    </section>
  );
}
