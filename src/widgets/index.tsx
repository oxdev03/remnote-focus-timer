import { declareIndexPlugin, type ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';

async function onActivate(plugin: ReactRNPlugin) {
  // Register Focus Timer settings
  await plugin.settings.registerNumberSetting({
    id: 'target-multiplier',
    title: 'Target Time Multiplier',
    description:
      'Multiply your average time by this factor to set the target time (e.g., 1.2 = 20% longer than average)',
    defaultValue: 1.2,
  });

  await plugin.settings.registerBooleanSetting({
    id: 'show-in-queue-toolbar',
    title: 'Show Timer in Queue Toolbar',
    description: 'Display the timer in the flashcard queue toolbar',
    defaultValue: true,
  });

  // Register the focus timer widgets based on user settings
  const showInQueueToolbar = await plugin.settings.getSetting('show-in-queue-toolbar');

  if (showInQueueToolbar) {
    await plugin.app.registerWidget('focus_timer_widget', WidgetLocation.QueueToolbar, {
      dimensions: { height: 'auto', width: 'auto' },
    });
  }
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
