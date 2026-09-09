export interface EmailTemplate {
  subject: string;
  html: (firstName: string) => string;
}

const baseStyle = `
  font-family: 'Helvetica Neue', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
`;

function wrap(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;">
  <div style="${baseStyle}">
    <!-- Header -->
    <div style="background:#1a3a5c;padding:24px 32px;border-radius:8px 8px 0 0;">
      <div style="color:#c9a84c;font-size:22px;font-weight:700;letter-spacing:-0.5px;">OPIAN</div>
      <div style="color:#8ab0cc;font-size:12px;margin-top:2px;">Financial Services</div>
    </div>
    <!-- Body -->
    <div style="padding:32px;background:#ffffff;border:1px solid #e8e8e8;border-top:none;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="padding:20px 32px;background:#f9f9f9;border:1px solid #e8e8e8;border-top:none;border-radius:0 0 8px 8px;text-align:center;">
      <p style="margin:0 0 8px;color:#888;font-size:12px;">OPIAN Financial Services &bull; info@opianfinancialservices.co.za</p>
      <p style="margin:0;color:#aaa;font-size:11px;">You're receiving this because you requested information from OPIAN. <a href="#" style="color:#1a3a5c;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#1a3a5c;line-height:1.3;">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;color:#444;font-size:15px;line-height:1.7;">${text}</p>`;
}

function cta(text: string): string {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="mailto:info@opianfinancialservices.co.za" style="display:inline-block;background:#c9a84c;color:#ffffff;font-weight:600;font-size:15px;padding:14px 32px;border-radius:6px;text-decoration:none;">${text}</a>
  </div>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e8e8e8;margin:20px 0;">`;
}

export const campaignTemplates: Record<number, EmailTemplate> = {
  0: {
    subject: "Welcome to OPIAN – Your Financial Journey Starts Here",
    html: (n) => wrap(`
      ${h1(`Welcome, ${n}!`)}
      ${p("Thank you for your interest in OPIAN Financial Services. We're excited to be part of your financial journey.")}
      ${p("At OPIAN, we believe every South African deserves expert, personalised financial guidance — whether you're planning for retirement, protecting your family, or growing your wealth.")}
      ${p("Over the next 30 days, we'll share valuable insights, tips, and strategies to help you make informed financial decisions. No jargon, no pressure — just honest advice.")}
      ${divider()}
      ${p("<strong>What to expect:</strong><br>✅ Expert insights on life cover, retirement, and investment<br>✅ Real-world strategies tailored for South Africans<br>✅ A free, no-obligation consultation when you're ready")}
      ${cta("Book a Free Consultation")}
    `)
  },
  1: {
    subject: "Do You Have Enough Life Cover? Most South Africans Don't",
    html: (n) => wrap(`
      ${h1(`${n}, let's talk about life cover`)}
      ${p("Studies show that the average South African is underinsured by up to <strong>60%</strong>. That means if something happened to you today, your family could be left with a significant shortfall.")}
      ${p("Life cover isn't about dying — it's about protecting the people you love while you're still here to make a difference.")}
      ${p("<strong>A simple rule of thumb:</strong> Your life cover should be at least 10–12 times your annual income to adequately protect your family's lifestyle.")}
      ${divider()}
      ${p("At OPIAN, we help you calculate exactly how much cover you need, compare the best products on the market, and put a plan in place that fits your budget.")}
      ${cta("Get My Free Cover Assessment")}
    `)
  },
  2: {
    subject: "What Would Happen to Your Income If You Couldn't Work?",
    html: (n) => wrap(`
      ${h1(`Income protection — the cover most people forget`)}
      ${p(`Hi ${n}, here's a sobering fact: <strong>1 in 3 South Africans</strong> will be unable to work for 3 months or more due to illness or injury at some point in their career.`)}
      ${p("Your ability to earn an income is your greatest financial asset. Income protection insurance replaces up to 75% of your salary if illness or injury stops you from working.")}
      ${p("Without it, most families exhaust their savings within 3–6 months. With it, life continues as normal while you focus on recovery.")}
      ${cta("Protect My Income Today")}
    `)
  },
  3: {
    subject: "The Hidden Danger in Your Financial Plan: Debt",
    html: (n) => wrap(`
      ${h1(`Is debt silently sabotaging your financial future?`)}
      ${p(`${n}, most South African families carry significant debt — home loans, vehicle finance, credit cards, personal loans. While some debt is strategic, unmanaged debt is the #1 barrier to building wealth.`)}
      ${p("The good news? A proper financial plan helps you tackle debt strategically while simultaneously building your savings and investments.")}
      ${p("<strong>Our debt-smart approach:</strong><br>🔑 Prioritise high-interest debt first<br>🔑 Use your credit profile to negotiate better rates<br>🔑 Free up cash flow for wealth creation")}
      ${cta("Get a Free Debt Assessment")}
    `)
  },
  4: {
    subject: "Dread Disease Cover: The Policy That Pays When You Need It Most",
    html: (n) => wrap(`
      ${h1(`What happens if you're diagnosed with cancer?`)}
      ${p(`${n}, one in four South Africans will be diagnosed with a critical illness in their lifetime. The medical costs, loss of income, and lifestyle changes can be devastating.`)}
      ${p("Dread disease (critical illness) cover pays out a lump sum on diagnosis of conditions like cancer, heart attack, or stroke — giving you the financial freedom to focus on recovery.")}
      ${p("This lump sum can be used for: treatment costs, paying off your bond, adapting your home, or taking unpaid leave. The choice is yours.")}
      ${cta("Explore Dread Disease Cover")}
    `)
  },
  5: {
    subject: "Investing 101: Where Should Your Money Be Working?",
    html: (n) => wrap(`
      ${h1(`Put your money to work, ${n}`)}
      ${p("Most South Africans keep their savings in a bank account earning 5–7% per year. Meanwhile, inflation sits at 5–6%, meaning their money barely keeps pace.")}
      ${p("Smart investing means your money grows <em>faster</em> than inflation, building real wealth over time. But with so many options — unit trusts, ETFs, endowments, RAs — where do you start?")}
      ${p("<strong>The OPIAN approach:</strong> We match you with the right investment vehicle based on your goals, timeline, tax situation, and risk appetite. No one-size-fits-all.")}
      ${cta("Start My Investment Journey")}
    `)
  },
  6: {
    subject: "Are You on Track for Retirement? 80% of South Africans Aren't",
    html: (n) => wrap(`
      ${h1(`Retirement planning: the earlier you start, the better`)}
      ${p(`${n}, only <strong>6%</strong> of South Africans retire financially independent. The rest depend on family, government grants, or simply keep working past 65.`)}
      ${p("The secret? Starting early and being consistent. Thanks to compound interest, R1,000 invested at 30 grows to nearly <strong>R8,000</strong> by retirement — while the same amount invested at 45 only reaches R3,000.")}
      ${p("Retirement Annuities (RAs) offer significant tax advantages, reducing your taxable income while building your nest egg.")}
      ${cta("Calculate My Retirement Gap")}
    `)
  },
  7: {
    subject: "One Week In — How Are We Doing?",
    html: (n) => wrap(`
      ${h1(`One week in, ${n} — thank you for staying with us`)}
      ${p("We've covered some important topics over the past week: life cover, income protection, dread disease, investing, and retirement. Hopefully some of these have sparked useful thinking about your own financial situation.")}
      ${p("Remember: <strong>you don't have to tackle everything at once.</strong> A good financial plan starts with a conversation — understanding where you are today and where you want to be tomorrow.")}
      ${p("Our advisors are available for a no-obligation chat at any time. There's no pressure, no hard sell — just honest, expert guidance.")}
      ${cta("Chat to an OPIAN Advisor")}
    `)
  },
  8: {
    subject: "Estate Planning: Protecting Your Legacy",
    html: (n) => wrap(`
      ${h1(`Your will — is it up to date?`)}
      ${p(`${n}, more than <strong>70% of South Africans</strong> die without a valid will. The consequences for your loved ones can be severe: delayed estates, legal disputes, and assets distributed in ways you never intended.`)}
      ${p("Estate planning goes beyond a will. It includes appointing guardians for minor children, planning for estate duty, and ensuring your assets transfer efficiently to the right people.")}
      ${p("At OPIAN, we guide you through the entire estate planning process to protect your legacy.")}
      ${cta("Protect My Estate")}
    `)
  },
  9: {
    subject: "Disability Cover: What Happens If You're Disabled?",
    html: (n) => wrap(`
      ${h1(`Disability is more common than you think`)}
      ${p(`${n}, the probability of becoming disabled before retirement is <strong>3x higher</strong> than the probability of dying during your working years. Yet most people have no disability cover.`)}
      ${p("Disability cover pays a lump sum or monthly income if you're permanently or temporarily unable to work due to injury or illness — protecting your lifestyle when you need it most.")}
      ${p("Combined with income protection, disability cover forms the cornerstone of a robust financial safety net.")}
      ${cta("Get Disability Cover Advice")}
    `)
  },
  10: {
    subject: "Emergency Fund: Your Financial First Line of Defence",
    html: (n) => wrap(`
      ${h1(`Do you have 3–6 months of expenses saved?`)}
      ${p(`${n}, financial emergencies happen to everyone — job loss, unexpected medical bills, home repairs, car trouble. Without an emergency fund, these events force people into debt.`)}
      ${p("Financial experts recommend keeping 3–6 months of living expenses in a liquid, interest-bearing account — accessible within 24–48 hours but separate from your everyday spending.")}
      ${p("An emergency fund isn't glamorous, but it's the foundation of every solid financial plan. Once it's in place, everything else becomes easier.")}
      ${cta("Build My Financial Foundation")}
    `)
  },
  11: {
    subject: "Tax-Smart Investing: Keep More of What You Earn",
    html: (n) => wrap(`
      ${h1(`Are you paying more tax than you need to?`)}
      ${p(`${n}, did you know that SARS allows you to deduct <strong>up to 27.5%</strong> of your taxable income (max R350,000 per year) in retirement annuity contributions?`)}
      ${p("Beyond RAs, tax-free savings accounts (TFSAs) allow you to earn investment returns completely free of tax — capital gains tax, dividends tax, and interest tax all eliminated.")}
      ${p("Smart tax planning isn't just for the wealthy. It's for anyone who wants to keep more of their hard-earned money working for them.")}
      ${cta("Explore Tax-Efficient Options")}
    `)
  },
  12: {
    subject: "Understanding Your Risk Profile",
    html: (n) => wrap(`
      ${h1(`Aggressive, moderate, or conservative — which are you?`)}
      ${p(`${n}, your investment risk profile determines how your money is invested. Choose too aggressively and you may panic when markets dip. Too conservatively, and inflation erodes your purchasing power.`)}
      ${p("Your ideal risk profile depends on: your investment timeline (how long until you need the money), your financial goals, your income stability, and your emotional response to market volatility.")}
      ${p("Getting this right is crucial. An OPIAN advisor will assess your profile and recommend the right investment strategy for your unique situation.")}
      ${cta("Discover My Risk Profile")}
    `)
  },
  13: {
    subject: "The 8th Wonder of the World: Compound Interest",
    html: (n) => wrap(`
      ${h1(`Einstein called it the most powerful force in the universe`)}
      ${p(`${n}, compound interest means you earn returns on your returns. Over time, this creates exponential growth that completely transforms what's possible for your wealth.`)}
      ${p("Example: R5,000 per month invested for 20 years at 12% annual return = <strong>R4.99 million</strong>. The total amount invested? Only R1.2 million. The rest — R3.79 million — is pure compound growth.")}
      ${p("The single most important factor is time. Every year you wait costs you exponentially more than you realise.")}
      ${cta("Start Growing My Wealth")}
    `)
  },
  14: {
    subject: "Two Weeks In — A Special Offer Just for You",
    html: (n) => wrap(`
      ${h1(`${n}, thank you for your interest in OPIAN`)}
      ${p("You've been following our financial education series for two weeks now, and we want to show our appreciation.")}
      ${p("<strong>For a limited time, we're offering a comprehensive financial needs analysis (FNA) at no charge.</strong> This is a R2,500 value, completely free.")}
      ${p("Our FNA covers: your complete insurance needs, retirement projections, investment strategy, tax optimisation, and estate planning requirements — all in one 60-minute session.")}
      ${cta("Claim My Free Financial Analysis")}
    `)
  },
  15: {
    subject: "Medical Aid vs Health Insurance: What You Really Need",
    html: (n) => wrap(`
      ${h1(`Are you covered for medical emergencies?`)}
      ${p(`${n}, healthcare costs are one of the biggest financial risks South Africans face. The question isn't just <em>whether</em> to have medical cover — it's <em>what type</em>.`)}
      ${p("Medical aid provides comprehensive healthcare access. Health insurance is a more affordable alternative for specific events. Gap cover fills the shortfall between what medical aid pays and what specialists charge.")}
      ${p("The right combination depends on your health history, family situation, and budget. Getting it wrong can cost you hundreds of thousands of rands.")}
      ${cta("Get Healthcare Cover Advice")}
    `)
  },
  16: {
    subject: "Investing in Your Children's Future",
    html: (n) => wrap(`
      ${h1(`University fees are rising faster than inflation`)}
      ${p(`${n}, university fees have increased by over <strong>8% per year</strong> for the past decade. A 4-year degree that costs R200,000 today will cost over R430,000 in 15 years.`)}
      ${p("Starting a dedicated education savings plan for your children now — even with small amounts — can make a significant difference. Endowment policies, TFSAs, and unit trusts are popular options.")}
      ${p("Give your children the gift of opportunity without the burden of student debt.")}
      ${cta("Start My Child's Education Fund")}
    `)
  },
  17: {
    subject: "Business Owners: Is Your Business Protecting You?",
    html: (n) => wrap(`
      ${h1(`Your business is an asset — treat it like one`)}
      ${p(`${n}, if you own a business, your financial planning needs are more complex — and more important — than the average employee.`)}
      ${p("Business cover considerations include: key man insurance (protecting the business if you die or become disabled), buy-and-sell agreements (ensuring business continuity), and business overhead protection (covering operating costs during illness).")}
      ${p("Many business owners pour everything into their business while neglecting their personal financial security. An OPIAN advisor can help you balance both.")}
      ${cta("Business Owner Financial Review")}
    `)
  },
  18: {
    subject: "Unit Trusts Explained Simply",
    html: (n) => wrap(`
      ${h1(`No jargon — just clear investment basics`)}
      ${p(`${n}, a unit trust pools money from many investors and invests it across a diversified portfolio — shares, bonds, property, and cash. Professional fund managers make the investment decisions.`)}
      ${p("Benefits of unit trusts: accessibility (start from R500/month), diversification (spread risk across hundreds of assets), liquidity (access your money when you need it), and professional management.")}
      ${p("Different unit trust funds suit different goals. From aggressive equity funds to stable income funds — there's an option for every investor.")}
      ${cta("Explore Investment Options")}
    `)
  },
  19: {
    subject: "Endowments: Tax-Efficient Saving for the Medium Term",
    html: (n) => wrap(`
      ${h1(`The investment wrapper high-earners often overlook`)}
      ${p(`${n}, if you're in the 36–45% tax bracket, an endowment policy can be a highly effective investment wrapper. The fund is taxed at 30% (lower than your personal rate) and benefits from favourable CGT treatment.`)}
      ${p("Endowments are ideal for: medium-term goals (5+ years), inheritance planning, and investors who want to limit annual investment decisions to reduce tax complexity.")}
      ${p("They're not for everyone — but for the right investor, an endowment can save thousands in tax annually.")}
      ${cta("Find Out If Endowments Suit Me")}
    `)
  },
  20: {
    subject: "Real Results: How OPIAN Helped the Nkosi Family",
    html: (n) => wrap(`
      ${h1(`From financial stress to financial freedom`)}
      ${p(`${n}, meet the Nkosi family (details changed for privacy). When they first came to OPIAN, they had R450,000 in debt, no life cover, and minimal retirement savings.`)}
      ${p("Three years later: their high-interest debt is cleared, they have comprehensive life and disability cover in place, R180,000 in their emergency fund, and R320,000 growing in a retirement annuity.")}
      ${p("<em>\"OPIAN didn't just give us a plan — they gave us hope. We finally feel in control of our money.\"</em> — The Nkosi Family")}
      ${p("Your story can have the same outcome. It starts with a single conversation.")}
      ${cta("Begin My Financial Transformation")}
    `)
  },
  21: {
    subject: "Retirement Annuities vs Pension Funds: Know the Difference",
    html: (n) => wrap(`
      ${h1(`Your retirement strategy depends on where you work`)}
      ${p(`${n}, if you're employed, your employer likely contributes to a pension or provident fund on your behalf. But is it enough?`)}
      ${p("Pension funds are tied to your employment — if you change jobs, accessing those funds can trigger significant tax penalties. A Retirement Annuity (RA) is portable, self-funded, and offers full tax deductibility.")}
      ${p("Most financial planners recommend supplementing your employer pension with an RA to bridge the gap between what you'll receive and what you'll actually need.")}
      ${cta("Review My Retirement Strategy")}
    `)
  },
  22: {
    subject: "The Real Cost of Not Having a Financial Plan",
    html: (n) => wrap(`
      ${h1(`What does financial planning actually cost vs. not planning?`)}
      ${p(`${n}, here's a number that might surprise you: the average South African retiree needs <strong>R8,000 per month</strong> to maintain a modest lifestyle. The average government pension pays R2,060 per month.`)}
      ${p("That R6,000/month shortfall — over 20 years of retirement — equals R1.44 million in today's money. Inflation makes it even worse.")}
      ${p("A proper financial plan, started today, can eliminate this gap entirely. Waiting even 5 more years significantly reduces what's achievable.")}
      ${cta("Close My Retirement Gap")}
    `)
  },
  23: {
    subject: "Why OPIAN Clients Stay with Us for Life",
    html: (n) => wrap(`
      ${h1(`Our commitment to you goes beyond a policy`)}
      ${p(`${n}, at OPIAN, we believe financial planning is a relationship, not a transaction. Our advisors don't just sell products — they build long-term plans that evolve with your life.`)}
      ${p("Annual reviews ensure your cover and investments stay aligned with your changing circumstances — new job, new baby, new home, divorce, inheritance. Life changes and your financial plan should too.")}
      ${p("We're independent advisors, which means we have no obligation to recommend any specific product. Our only obligation is to you.")}
      ${cta("Experience the OPIAN Difference")}
    `)
  },
  24: {
    subject: "The Power of a Written Financial Plan",
    html: (n) => wrap(`
      ${h1(`People with written plans accumulate 3x more wealth`)}
      ${p(`${n}, research consistently shows that people with a written financial plan save more, invest more consistently, and retire more comfortably than those without one.`)}
      ${p("A written plan creates accountability, clarity, and direction. It turns vague intentions like 'save more' into concrete, measurable goals with deadlines.")}
      ${p("An OPIAN financial plan covers every aspect of your financial life in a single, integrated document — updated regularly as your life evolves.")}
      ${cta("Get My Written Financial Plan")}
    `)
  },
  25: {
    subject: "Your Free 60-Minute Financial Review — Limited Spots",
    html: (n) => wrap(`
      ${h1(`${n}, we'd love to meet with you`)}
      ${p("We're offering a limited number of complimentary 60-minute financial reviews this month. This session covers:")}
      ${p("✅ Complete insurance needs analysis<br>✅ Retirement readiness assessment<br>✅ Investment portfolio review<br>✅ Tax optimisation opportunities<br>✅ Estate planning essentials")}
      ${p("There's no cost, no obligation, and no pressure. Just a clear picture of where you stand financially and what steps you can take to improve.")}
      ${cta("Claim My Free Review — Limited Spots")}
    `)
  },
  26: {
    subject: "Your Top Financial Questions Answered",
    html: (n) => wrap(`
      ${h1(`Common questions we hear every day`)}
      ${p(`${n}, here are the questions our advisors get asked most often:`)}
      ${p("<strong>\"How much life cover do I need?\"</strong> — Typically 10–12x your annual income, adjusted for existing assets and debt.")}
      ${p("<strong>\"When should I start saving for retirement?\"</strong> — Yesterday. The second best time is today.")}
      ${p("<strong>\"Can I afford financial advice?\"</strong> — Can you afford not to have it? Our initial consultation is free.")}
      ${p("<strong>\"What's the best investment?\"</strong> — The one that matches your goals, timeline, and risk profile. There's no universal answer.")}
      ${cta("Ask Us Your Question")}
    `)
  },
  27: {
    subject: "What to Expect When You Meet with OPIAN",
    html: (n) => wrap(`
      ${h1(`No surprises — here's exactly how it works`)}
      ${p(`${n}, we know meeting with a financial advisor can feel daunting. Here's exactly what you can expect from your first OPIAN consultation:`)}
      ${p("📋 <strong>Step 1 – Discovery (20 min):</strong> We listen. What are your goals? What keeps you up at night? What does financial security look like for you?")}
      ${p("📊 <strong>Step 2 – Analysis (20 min):</strong> We review your current situation — income, expenses, existing cover, savings, and debt.")}
      ${p("💡 <strong>Step 3 – Recommendations (20 min):</strong> We present clear, prioritised recommendations. No jargon, no pressure.")}
      ${p("That's it. One conversation can change your financial future.")}
      ${cta("Book My Consultation")}
    `)
  },
  28: {
    subject: "Only a Few Days Left — Don't Miss This",
    html: (n) => wrap(`
      ${h1(`${n}, our free consultation offer closes soon`)}
      ${p("We've been sharing financial insights with you for nearly a month, and we want to make sure you have the opportunity to take action before our free consultation slots fill up.")}
      ${p("The people who benefit most from financial planning are those who act — not those who intend to act 'someday'. The best time is now, while the opportunity is on the table.")}
      ${p("Book your free 60-minute session and walk away with a clear, personalised financial roadmap. No cost. No commitment.")}
      ${cta("Book Before Spots Fill Up")}
    `)
  },
  29: {
    subject: "Tomorrow Is Your Last Day — Here's Our Invitation",
    html: (n) => wrap(`
      ${h1(`One last chance to connect, ${n}`)}
      ${p("This is our second-to-last email in this series, and we want to be direct: we believe you deserve a better financial future, and we'd genuinely love to help you achieve it.")}
      ${p("Whether you're worried about protecting your family, building wealth, or retiring comfortably — OPIAN has the expertise and the products to help you get there.")}
      ${p("Tomorrow's email will be our last in this series. We hope you'll take us up on our free consultation offer before then.")}
      ${cta("Yes, I'd Like My Free Consultation")}
    `)
  },
  30: {
    subject: "This Is Our Last Email — But Our Door Is Always Open",
    html: (n) => wrap(`
      ${h1(`Thank you, ${n} — this is goodbye (for now)`)}
      ${p("This is the final email in our 30-day financial insights series. We hope the information has been valuable and has given you a clearer picture of what's possible for your financial future.")}
      ${p("If you've been on the fence about booking a consultation, this is your last nudge: <strong>our first session is always free, always no-pressure, and always personalised to you.</strong>")}
      ${p("Even if you're not ready today, please know that our door is always open. When the time is right — whether it's next week or next year — OPIAN will be here.")}
      ${p("Thank you for trusting us with your inbox. We wish you and your family a financially secure future.")}
      ${cta("Book When You're Ready")}
      ${divider()}
      ${p("With warm regards,<br><strong>The OPIAN Team</strong><br>info@opianfinancialservices.co.za")}
    `)
  },
};

/** Returns the template for a given day (0–30). Falls back to a generic follow-up for any gap. */
export function getTemplate(day: number): EmailTemplate {
  if (campaignTemplates[day]) return campaignTemplates[day];

  // Generic follow-up for any unlisted day
  return {
    subject: `OPIAN Financial Services – Your Financial Future Matters`,
    html: (n) => wrap(`
      ${h1(`Hi ${n} — a quick note from OPIAN`)}
      ${p("We're on a mission to help every South African achieve financial security, and we'd love to help you do the same.")}
      ${p("Whether you need life cover, a retirement strategy, investment advice, or a comprehensive financial plan — our team of expert advisors is ready to help.")}
      ${p("Our initial consultation is free, personalised, and carries zero obligation. We simply have a conversation about your goals and how we might help.")}
      ${cta("Let's Talk — Free Consultation")}
    `)
  };
}
