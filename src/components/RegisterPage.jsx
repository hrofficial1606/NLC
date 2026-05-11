import { useMemo } from "react";
import Button from "./ui/Button";

const planMeta = {
  elite: {
    title: "Elite Package",
    price: "₹5000",
    tone: "elite",
  },
  gold: {
    title: "Gold Package",
    price: "₹3000",
    tone: "gold",
  },
};

const formFields = [
  { name: "fullName", label: "Full Name", type: "text" },
  { name: "mobile", label: "Mobile Number", type: "tel" },
  { name: "email", label: "Email Address", type: "email" },
  { name: "city", label: "City", type: "text" },
  { name: "business", label: "Business / Profession", type: "text" },
  { name: "instagram", label: "Instagram Profile", type: "text" },
];

export default function RegisterPage({ selectedPlan = "elite", onNavigate = () => {} }) {
  const plan = useMemo(() => planMeta[selectedPlan] ?? planMeta.elite, [selectedPlan]);

  return (
    <section className="register-page">
      <div className="container register-page__inner">
        <p className="register-page__eyebrow">Complete your registration</p>
        <h1>Be a Member</h1>
        <p className="register-page__intro">
          Fill in your details to continue with the selected membership package.
        </p>

        <div className="register-page__plan-row">
          <div className={`register-page__plan register-page__plan--${plan.tone}`}>
            <span>{plan.title}</span>
            <strong>{plan.price}</strong>
          </div>
          <Button variant="peach" onClick={() => onNavigate("membership")}>
            Change Plan
          </Button>
        </div>

        <form className="register-page__form">
          <div className="register-page__grid">
            {formFields.map((field) => (
              <label key={field.name} className="register-page__field">
                <span>{field.label}</span>
                <input type={field.type} name={field.name} placeholder={field.label} />
              </label>
            ))}
          </div>

          <label className="register-page__field register-page__field--full">
            <span>Why do you want to join?</span>
            <textarea
              name="message"
              rows="5"
              placeholder="Tell us a little about yourself and why you want to join Nagpur Ladies Club."
            />
          </label>

          <div className="register-page__actions">
            <Button variant="secondary" onClick={() => onNavigate("membership")} type="button">
              Back
            </Button>
            <Button variant="peach" type="submit">
              Register Now
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
