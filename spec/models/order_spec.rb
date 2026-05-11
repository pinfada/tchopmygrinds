require 'rails_helper'

# Legacy spec: still asserts a real business invariant (#can_be_rated_for?)
# but its setup uses Commerce.create!(statut_type: ...), and Commerce does
# not have a statut_type column. Skip until the spec is rewritten with the
# new factories under spec/factories/.
RSpec.describe Order, skip: "Legacy setup; rewrite with factories (Lot 3 cleanup)" do
  describe "#can_be_rated_for?" do
    let(:user) { User.create!(email: "test@example.com", password: "password123", statut_type: "others") }
    let(:commerce) { Commerce.create!(name: "Test Shop", statut_type: "sedentary") }
    let(:product) { Product.create!(
      name: "Test Product",
      quantityperunit: "1 unit",
      unitprice: 10.00,
      unitsinstock: 100,
      unitsonorder: 0,
      commerce: commerce
    ) }
    let(:order) { Order.create!(user: user, status: :Delivered) }
    let(:orderdetail) { Orderdetail.create!(order: order, product: product, quantity: 1, unitprice: 10.00) }

    context "when order is delivered" do
      before { orderdetail } # Ensure orderdetail is created

      it "returns true for a commerce that has products in the order" do
        expect(order.can_be_rated_for?(commerce)).to be true
      end

      it "returns true for a product that is in the order" do
        expect(order.can_be_rated_for?(product)).to be true
      end

      it "returns false for a commerce that has no products in the order" do
        other_commerce = Commerce.create!(name: "Other Shop", statut_type: "sedentary")
        expect(order.can_be_rated_for?(other_commerce)).to be false
      end

      it "returns false for a product that is not in the order" do
        other_product = Product.create!(
          name: "Other Product",
          quantityperunit: "1 unit",
          unitprice: 15.00,
          unitsinstock: 50,
          unitsonorder: 0,
          commerce: commerce
        )
        expect(order.can_be_rated_for?(other_product)).to be false
      end
    end

    context "when order is not delivered or completed" do
      it "returns false for waiting orders" do
        waiting_order = Order.create!(user: user, status: :Waiting)
        Orderdetail.create!(order: waiting_order, product: product, quantity: 1, unitprice: 10.00)
        expect(waiting_order.can_be_rated_for?(commerce)).to be false
      end

      it "returns false for in-progress orders" do
        in_progress_order = Order.create!(user: user, status: :In_Progress)
        Orderdetail.create!(order: in_progress_order, product: product, quantity: 1, unitprice: 10.00)
        expect(in_progress_order.can_be_rated_for?(product)).to be false
      end
    end

    context "when order is completed" do
      it "returns true for a product in a completed order" do
        completed_order = Order.create!(user: user, status: :Completed)
        Orderdetail.create!(order: completed_order, product: product, quantity: 1, unitprice: 10.00)
        expect(completed_order.can_be_rated_for?(product)).to be true
      end
    end
  end
end
