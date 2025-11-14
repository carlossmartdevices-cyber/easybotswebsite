const UserService = require('../../src/services/UserService');
const { User, sequelize } = require('../../src/models');

describe('UserService', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await User.destroy({ where: {} });
  });

  describe('findByTelegramId', () => {
    it('should find user by telegram id', async () => {
      await User.create({
        telegram_id: 123456789,
        username: 'testuser'
      });

      const user = await UserService.findByTelegramId(123456789);
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
    });

    it('should return null if user not found', async () => {
      const user = await UserService.findByTelegramId(999999999);
      expect(user).toBeNull();
    });
  });

  describe('upsert', () => {
    it('should create new user if not exists', async () => {
      const { user, created } = await UserService.upsert(123456789, {
        username: 'newuser',
        first_name: 'New'
      });

      expect(created).toBe(true);
      expect(user.username).toBe('newuser');
    });

    it('should update existing user', async () => {
      await User.create({
        telegram_id: 123456789,
        username: 'olduser'
      });

      const { user, created } = await UserService.upsert(123456789, {
        username: 'updateduser'
      });

      expect(created).toBe(false);
      expect(user.username).toBe('updateduser');
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      await User.create({
        telegram_id: 123456789,
        username: 'testuser',
        plan: 'basic'
      });

      const user = await UserService.update(123456789, {
        plan: 'premium'
      });

      expect(user.plan).toBe('premium');
    });

    it('should throw error if user not found', async () => {
      await expect(
        UserService.update(999999999, { plan: 'premium' })
      ).rejects.toThrow('User 999999999 not found');
    });
  });

  describe('updateStatus', () => {
    it('should update user status', async () => {
      await User.create({
        telegram_id: 123456789,
        username: 'testuser'
      });

      const user = await UserService.updateStatus(123456789, 'inactive');
      expect(user.status).toBe('inactive');
    });
  });

  describe('updatePlan', () => {
    it('should update user plan', async () => {
      await User.create({
        telegram_id: 123456789,
        username: 'testuser',
        plan: 'basic'
      });

      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const user = await UserService.updatePlan(123456789, 'premium', endDate);

      expect(user.plan).toBe('premium');
      expect(user.subscription_end).toBeInstanceOf(Date);
    });
  });

  describe('extendSubscription', () => {
    it('should extend subscription by specified days', async () => {
      const currentEnd = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      await User.create({
        telegram_id: 123456789,
        username: 'testuser',
        subscription_end: currentEnd
      });

      const user = await UserService.extendSubscription(123456789, 30);
      const diff = (user.subscription_end - currentEnd) / (1000 * 60 * 60 * 24);

      expect(diff).toBeCloseTo(30, 0);
    });
  });

  describe('search methods', () => {
    beforeEach(async () => {
      await User.bulkCreate([
        {
          telegram_id: 111,
          username: 'johndoe',
          first_name: 'John',
          last_name: 'Doe'
        },
        {
          telegram_id: 222,
          username: 'janedoe',
          first_name: 'Jane',
          last_name: 'Doe'
        }
      ]);
    });

    it('should search by username', async () => {
      const users = await UserService.searchByUsername('john');
      expect(users.length).toBeGreaterThan(0);
      expect(users[0].username).toContain('john');
    });

    it('should search by name', async () => {
      const users = await UserService.searchByName('jane');
      expect(users.length).toBeGreaterThan(0);
      expect(users[0].first_name.toLowerCase()).toContain('jane');
    });
  });

  describe('getStatistics', () => {
    it('should return user statistics', async () => {
      await User.bulkCreate([
        { telegram_id: 111, plan: 'basic', status: 'active' },
        { telegram_id: 222, plan: 'premium', status: 'active' },
        { telegram_id: 333, plan: 'gold', status: 'active' },
        { telegram_id: 444, plan: 'basic', status: 'inactive' }
      ]);

      const stats = await UserService.getStatistics();

      expect(stats.total).toBe(4);
      expect(stats.active).toBe(3);
      expect(stats.premium).toBe(1);
      expect(stats.gold).toBe(1);
    });
  });

  describe('countByPlan', () => {
    it('should count users by plan', async () => {
      await User.bulkCreate([
        { telegram_id: 111, plan: 'basic', status: 'active' },
        { telegram_id: 222, plan: 'premium', status: 'active' },
        { telegram_id: 333, plan: 'premium', status: 'active' },
        { telegram_id: 444, plan: 'gold', status: 'active' }
      ]);

      const counts = await UserService.countByPlan();

      expect(counts.basic).toBe(1);
      expect(counts.premium).toBe(2);
      expect(counts.gold).toBe(1);
    });
  });
});
