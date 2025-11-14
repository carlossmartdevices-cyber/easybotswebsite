const { User, sequelize } = require('../../src/models');

describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await User.destroy({ where: {} });
  });

  describe('Model Creation', () => {
    it('should create a new user', async () => {
      const user = await User.create({
        telegram_id: 123456789,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        plan: 'basic'
      });

      expect(user.telegram_id).toBe(123456789);
      expect(user.username).toBe('testuser');
      expect(user.plan).toBe('basic');
      expect(user.status).toBe('active');
    });

    it('should create a user with UUID id', async () => {
      const user = await User.create({
        telegram_id: 987654321,
        username: 'anotheruser'
      });

      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('string');
    });

    it('should enforce unique telegram_id constraint', async () => {
      await User.create({
        telegram_id: 111222333,
        username: 'user1'
      });

      await expect(
        User.create({
          telegram_id: 111222333,
          username: 'user2'
        })
      ).rejects.toThrow();
    });

    it('should validate plan values', async () => {
      await expect(
        User.create({
          telegram_id: 444555666,
          plan: 'invalid_plan'
        })
      ).rejects.toThrow();
    });

    it('should validate status values', async () => {
      await expect(
        User.create({
          telegram_id: 777888999,
          status: 'invalid_status'
        })
      ).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        telegram_id: 123456789,
        username: 'testuser',
        plan: 'premium',
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });
    });

    it('should check if subscription is active', () => {
      expect(user.isSubscriptionActive()).toBe(true);
    });

    it('should check if subscription is expired', async () => {
      user.subscription_end = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
      expect(user.isSubscriptionActive()).toBe(false);
    });

    it('should calculate days until expiry', () => {
      const days = user.getDaysUntilExpiry();
      expect(days).toBeGreaterThan(29);
      expect(days).toBeLessThanOrEqual(30);
    });

    it('should extend subscription', async () => {
      const originalEnd = user.subscription_end;
      await user.extendSubscription(30);

      const newEnd = user.subscription_end;
      const diff = (new Date(newEnd) - new Date(originalEnd)) / (1000 * 60 * 60 * 24);

      expect(diff).toBeCloseTo(30, 0);
    });
  });

  describe('Class Methods', () => {
    beforeEach(async () => {
      await User.bulkCreate([
        {
          telegram_id: 111,
          username: 'user1',
          first_name: 'John',
          plan: 'basic',
          status: 'active'
        },
        {
          telegram_id: 222,
          username: 'user2',
          first_name: 'Jane',
          plan: 'premium',
          status: 'active'
        },
        {
          telegram_id: 333,
          username: 'user3',
          first_name: 'Bob',
          plan: 'gold',
          status: 'inactive'
        }
      ]);
    });

    it('should find user by telegram id', async () => {
      const user = await User.findByTelegramId(111);
      expect(user).toBeDefined();
      expect(user.username).toBe('user1');
    });

    it('should find active users', async () => {
      const users = await User.findActiveUsers();
      expect(users).toHaveLength(2);
    });

    it('should find users by plan', async () => {
      const users = await User.findByPlan('premium');
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('user2');
    });

    it('should search users by username', async () => {
      const users = await User.searchByUsername('user1');
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('user1');
    });

    it('should search users by name', async () => {
      const users = await User.searchByName('john');
      expect(users.length).toBeGreaterThan(0);
      expect(users[0].first_name.toLowerCase()).toContain('john');
    });

    it('should get statistics', async () => {
      const stats = await User.getStatistics();
      expect(stats.total).toBe(3);
      expect(stats.active).toBe(2);
      expect(stats.premium).toBe(1);
      expect(stats.gold).toBe(0); // inactive user doesn't count
    });
  });

  describe('Timestamps', () => {
    it('should automatically set created_at and updated_at', async () => {
      const user = await User.create({
        telegram_id: 123456789,
        username: 'testuser'
      });

      expect(user.created_at).toBeInstanceOf(Date);
      expect(user.updated_at).toBeInstanceOf(Date);
    });

    it('should update updated_at on save', async () => {
      const user = await User.create({
        telegram_id: 123456789,
        username: 'testuser'
      });

      const originalUpdatedAt = user.updated_at;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      user.username = 'newusername';
      await user.save();

      expect(user.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
